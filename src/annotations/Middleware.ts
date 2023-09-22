/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

import { debug } from '#src/debug'
import { Annotation } from '@athenna/ioc'
import { Options, String } from '@athenna/common'
import type { MiddlewareOptions } from '#src/types/middlewares/MiddlewareOptions'

/**
 * Create a middleware inside the service provider.
 */
export function Middleware(options?: MiddlewareOptions): ClassDecorator {
  return (target: any) => {
    options = Options.create(options, {
      isGlobal: false,
      type: 'transient',
      alias: `App/Http/Middlewares/${target.name}`,
      name: String.toCamelCase(target.name)
    })

    options.name = `App/Http/Middlewares/Names/${options.name}`

    debug('Registering middleware metadata for the service container %o', {
      ...options,
      name: target.name,
      namedAlias: options.name
    })

    if (ioc.has(options.name)) {
      debug(
        'Skipping registration, named alias %s is already registered.',
        options.name
      )

      return
    }

    if (ioc.has(options.alias)) {
      debug(
        'Skipping registration, alias %s is already registered.',
        options.alias
      )

      return
    }

    Annotation.defineMeta(target, options)
  }
}
