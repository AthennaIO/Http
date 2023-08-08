/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/exceptions/HttpException'

export class ServiceUnavailableException extends HttpException {
  /**
   * This exception uses the 503 status code and the "E_SERVICE_UNAVAILABLE_ERROR" code.
   *
   * @example
   * ```js
   * throw new ServiceUnavailableException()
   * ```
   */
  public constructor(
    message = 'Service unavailable error happened.',
    help = null,
  ) {
    super({ help, message, status: 503, code: 'E_SERVICE_UNAVAILABLE_ERROR' })
  }
}
