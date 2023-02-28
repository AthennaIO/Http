/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class NotAcceptableException extends HttpException {
  /**
   * This exception uses the 406 status code and the "E_NOT_ACCEPTABLE_ERROR" code.
   *
   * @example
   * ```js
   * throw new NotAcceptableException()
   * ```
   */
  public constructor(message = 'Not acceptable error happened.', help = null) {
    super({ help, message, status: 406, code: 'E_NOT_ACCEPTABLE_ERROR' })
  }
}
