/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class RequestTimeoutException extends HttpException {
  /**
   * This exception uses the 408 status code and the "E_REQUEST_TIMEOUT_ERROR" code.
   *
   * @example
   * ```js
   * throw new RequestTimeoutException()
   * ```
   */
  public constructor(message = 'Request timeout error happened.', help = null) {
    super({ help, message, status: 408, code: 'E_REQUEST_TIMEOUT_ERROR' })
  }
}
