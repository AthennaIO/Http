/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class BadGatewayException extends HttpException {
  /**
   * This exception uses the 502 status code and the "E_BAD_GATEWAY_ERROR" code.
   *
   * @example
   * ```js
   * throw new BadGatewayException()
   * ```
   */
  public constructor(message = 'Bad gateway error happened.', help = null) {
    super({ help, message, status: 502, code: 'E_BAD_GATEWAY_ERROR' })
  }
}
