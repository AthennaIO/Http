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
import { Options } from '@athenna/common'
import type { ControllerOptions } from '#src/types/controllers/ControllerOptions'

/**
 * Create a controller inside the service provider.
 */
export function Controller(options?: ControllerOptions): ClassDecorator {
  return (target: any) => {
    options = Options.create(options, {
      alias: `App/Http/Controllers/${target.name}`,
      type: 'transient',
    })

    const alias = options.alias
    const createCamelAlias = false

    if (ioc.hasDependency(alias)) {
      debug(
        'Controller %s was already registered in the service container. Skipping registration via Controller annotation.',
        alias,
      )

      return
    }

    ioc[options.type](alias, target, createCamelAlias)

    Reflect.defineMetadata('ioc:registered', true, target)
  }
}
