/**
 * @athenna/logger
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class ServiceUnavailableException extends HttpException {
  /**
   * Creates a new instance of ServiceUnavailableException.
   *
   * @example
   *  throw new ServiceUnavailableException()
   *  This exception uses the 503 status code and the "E_SERVICE_UNAVAILABLE_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(
    content = 'Service unavailable error',
    code = 'E_SERVICE_UNAVAILABLE_ERROR',
    help = null,
  ) {
    super(content, 503, code, help)
  }
}
