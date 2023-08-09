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
import type { TerminatorContract } from '#src/types/contracts/TerminatorContract'
import type { MiddlewareOptions } from '#src/types/middlewares/MiddlewareOptions'
import { debug } from '#src/debug/index'

/**
 * Create a terminator inside the service provider.
 */
export function Terminator(options?: MiddlewareOptions): ClassDecorator {
  return (target: any) => {
    options = Options.create(options, {
      isGlobal: false,
      name: String.toCamelCase(target.name),
      alias: `App/Http/Terminators/${target.name}`,
      type: 'transient',
    })

    const alias = options.alias
    const createCamelAlias = false

    if (ioc.hasDependency(alias)) {
      debug(
        'Terminator %s was already registered in the service container. Skipping registration via Terminator annotation.',
        alias,
      )

      return
    }

    ioc[options.type](alias, target, createCamelAlias)

    Reflect.defineMetadata('ioc:registered', true, target)

    if (!options.isGlobal) {
      ioc.alias(`App/Http/Terminators/Names/${options.name}`, alias)

      return
    }

    const Terminator = ioc.safeUse<TerminatorContract>(alias)

    debug(
      'Registering %s as a global terminator via Terminator annotation.',
      Terminator.constructor.name,
    )

    Server.middleware(Terminator.terminate)
  }
}
