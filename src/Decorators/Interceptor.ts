/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

import { Server } from '#src/Facades/Server'
import { Options, String } from '@athenna/common'
import { MiddlewareOptions } from '#src/Types/Middlewares/MiddlewareOptions'
import { InterceptorContract } from '#src/Contracts/Middlewares/InterceptorContract'

/**
 * Create a interceptor inside the service provider.
 */
export function Interceptor(options?: MiddlewareOptions): ClassDecorator {
  return (target: any) => {
    options = Options.create(options, {
      isGlobal: false,
      name: String.toCamelCase(target.name),
      alias: `App/Http/Interceptors/${target.name}`,
      type: 'transient',
    })

    const alias = options.alias
    const createCamelAlias = false

    if (ioc.hasDependency(alias)) {
      return
    }

    ioc[options.type](alias, target, createCamelAlias)

    Reflect.defineMetadata('provider:registered', true, target)

    if (!options.isGlobal) {
      ioc.alias(`App/Http/Interceptors/Names/${options.name}`, alias)

      return
    }

    const Interceptor = ioc.safeUse<InterceptorContract>(alias)

    Server.intercept(Interceptor.intercept)
  }
}
