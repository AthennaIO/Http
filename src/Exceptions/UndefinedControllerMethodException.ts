/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class UndefinedControllerMethodException extends Exception {
  public constructor(method: string, controller: string) {
    const content = `The method ${method} is not defined inside your controller ${controller}`

    super(
      content,
      500,
      'UNDEFINED_METHOD_ERROR',
      `Remember defining the method ${method} inside your controller ${controller}`,
    )
  }
}
