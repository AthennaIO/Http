/**
 * @athenna/logger
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class PayloadTooLargeException extends HttpException {
  /**
   * Creates a new instance of PayloadTooLargeException.
   *
   * @example
   *  throw new PayloadTooLargeException()
   *  This exception uses the 413 status code and the "E_PAYLOAD_TOO_LARGE_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(
    content = 'Payload too large error',
    code = 'E_PAYLOAD_TOO_LARGE_ERROR',
    help = null,
  ) {
    super(content, 413, code, help)
  }
}
