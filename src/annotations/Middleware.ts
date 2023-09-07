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
import type { MiddlewareContract } from '#src/types/contracts/MiddlewareContract'
import type { MiddlewareOptions } from '#src/types/middlewares/MiddlewareOptions'
import { debug } from '#src/debug/index'

/**
 * Create a middleware inside the service provider.
 */
export function Middleware(options?: MiddlewareOptions): ClassDecorator {
  return (target: any) => {
    options = Options.create(options, {
      isGlobal: false,
      name: String.toCamelCase(target.name),
      alias: `App/Http/Middlewares/${target.name}`,
      type: 'transient'
    })

    const alias = options.alias
    const createCamelAlias = false

    if (ioc.hasDependency(alias)) {
      debug(
        'Middleware %s was already registered in the service container. Skipping registration via Middleware annotation.',
        alias
      )

      return
    }

    ioc[options.type](alias, target, createCamelAlias)

    Reflect.defineMetadata('ioc:registered', true, target)

    if (!options.isGlobal) {
      ioc.alias(`App/Http/Middlewares/Names/${options.name}`, alias)

      return
    }

    const Middleware = ioc.safeUse<MiddlewareContract>(alias)

    debug(
      'Registering %s as a global middleware via Middleware annotation.',
      Middleware.constructor.name
    )

    Server.middleware(Middleware.handle)
  }
}
