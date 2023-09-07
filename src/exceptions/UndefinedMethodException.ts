/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class UndefinedMethodException extends Exception {
  public constructor(method: string, className: string) {
    super({
      status: 500,
      code: 'E_UNDEFINED_METHOD',
      message: `Cannot register the ${method} method in your Route because it's not defined inside your ${className} class.`,
      help: `Remember defining the method ${method} inside your ${className} class.`
    })
  }
}
