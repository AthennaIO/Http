/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/exceptions/HttpException'

export class PayloadTooLargeException extends HttpException {
  /**
   * This exception uses the 413 status code and the "E_PAYLOAD_TOO_LARGE_ERROR" code.
   *
   * @example
   * ```js
   * throw new PayloadTooLargeException()
   * ```
   */
  public constructor(
    message = 'Payload to large error happened.',
    help = null
  ) {
    super({ help, message, status: 413, code: 'E_PAYLOAD_TOO_LARGE_ERROR' })
  }
}
