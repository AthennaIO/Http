/**
 * @athenna/logger
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class BadGatewayException extends HttpException {
  /**
   * Creates a new instance of BadGatewayException.
   *
   * @example
   *  throw new BadGatewayException()
   *  This exception uses the 502 status code and the "E_BAD_GATEWAY_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(
    content = 'Bad gateway error',
    code = 'E_BAD_GATEWAY_ERROR',
    help = null,
  ) {
    super(content, 502, code, help)
  }
}
