/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class NotImplementedException extends HttpException {
  /**
   * This exception uses the 501 status code and the "E_NOT_IMPLEMENTED_ERROR" code.
   *
   * @example
   * ```js
   * throw new NotImplementedException()
   * ```
   */
  public constructor(message = 'Not implemented error happened.', help = null) {
    super({ help, message, status: 501, code: 'E_NOT_IMPLEMENTED_ERROR' })
  }
}
