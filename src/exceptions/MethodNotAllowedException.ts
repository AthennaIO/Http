/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/exceptions/HttpException'

export class MethodNotAllowedException extends HttpException {
  /**
   * This exception uses the 405 status code and the "E_METHOD_NOT_ALLOWED_ERROR" code.
   *
   * @example
   * ```js
   * throw new MethodNotAllowedException()
   * ```
   */
  public constructor(
    message = 'Method not allowed error happened.',
    help = null
  ) {
    super({ help, message, status: 405, code: 'E_METHOD_NOT_ALLOWED_ERROR' })
  }
}
