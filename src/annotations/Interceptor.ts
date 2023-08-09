/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

import { Server } from '#src/facades/Server'
import { Options, String } from '@athenna/common'
import type { InterceptorContract } from '#src/types/contracts/InterceptorContract'
import type { MiddlewareOptions } from '#src/types/middlewares/MiddlewareOptions'
import { debug } from '#src/debug/index'

/**
 * Create an interceptor inside the service provider.
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
      debug(
        'Interceptor %s was already registered in the service container. Skipping registration via Interceptor annotation.',
        alias,
      )

      return
    }

    ioc[options.type](alias, target, createCamelAlias)

    Reflect.defineMetadata('ioc:registered', true, target)

    if (!options.isGlobal) {
      ioc.alias(`App/Http/Interceptors/Names/${options.name}`, alias)

      return
    }

    const Interceptor = ioc.safeUse<InterceptorContract>(alias)

    debug(
      'Registering %s as a global interceptor via Interceptor annotation.',
      Interceptor.constructor.name,
    )

    Server.intercept(Interceptor.intercept)
  }
}
