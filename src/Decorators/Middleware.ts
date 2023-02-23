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
import { MiddlewareContract } from '#src/Contracts/Middlewares/MiddlewareContract'

/**
 * Create a middleware inside the service provider.
 */
export function Middleware(options?: MiddlewareOptions): ClassDecorator {
  return (target: any) => {
    options = Options.create(options, {
      isGlobal: false,
      name: String.toCamelCase(target.name),
      alias: `App/Http/Middlewares/${target.name}`,
      type: 'transient',
    })

    const alias = options.alias
    const createCamelAlias = false

    if (ioc.hasDependency(alias)) {
      return
    }

    ioc[options.type](alias, target, createCamelAlias)

    if (!options.isGlobal) {
      ioc.alias(`App/Http/Middlewares/Names/${options.name}`, alias)

      return
    }

    const Middleware = ioc.safeUse<MiddlewareContract>(alias)

    Server.middleware(Middleware.handle)
  }
}
