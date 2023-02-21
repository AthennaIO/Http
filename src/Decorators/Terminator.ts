/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

import { Options } from '@athenna/common'
import { ControllerOptions } from '#src/Types/Controllers/ControllerOptions'

/**
 * Create a terminator inside the service provider.
 */
export function Terminator(options?: ControllerOptions): ClassDecorator {
  return (target: any) => {
    options = Options.create(options, {
      alias: `App/Http/Terminators/${target.name}`,
      type: 'transient',
    })

    const alias = options.alias
    const createCamelAlias = false

    if (ioc.hasDependency(alias)) {
      return
    }

    ioc[options.type](alias, target, createCamelAlias)
  }
}
