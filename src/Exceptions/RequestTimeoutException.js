/**
 * @athenna/logger
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class RequestTimeoutException extends HttpException {
  /**
   * Creates a new instance of RequestTimeoutException.
   *
   * @example
   *  throw new RequestTimeoutException()
   *  This exception uses the 408 status code and the "E_REQUEST_TIMEOUT_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(
    content = 'Request timeout error',
    code = 'E_REQUEST_TIMEOUT_ERROR',
    help = null,
  ) {
    super(content, 408, code, help)
  }
}
