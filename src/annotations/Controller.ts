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
import { Annotation } from '@athenna/ioc'
import type { ControllerOptions } from '#src/types/controllers/ControllerOptions'

/**
 * Create a controller inside the service provider.
 */
export function Controller(options?: ControllerOptions): ClassDecorator {
  return (target: any) => {
    options = Options.create(options, {
      alias: `App/Http/Controllers/${target.name}`,
      type: 'transient'
    })

    debug('Registering controller metadata for the service container %o', {
      name: target.name,
      ...options
    })

    if (ioc.has(options.alias) || ioc.has(options.camelAlias)) {
      debug('Skipping registration, controller is already registered.')

      return
    }

    Annotation.defineMeta(target, options)
  }
}
