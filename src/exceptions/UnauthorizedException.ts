/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/exceptions/HttpException'

export class UnauthorizedException extends HttpException {
  /**
   * This exception uses the 401 status code and the "E_UNAUTHORIZED_ERROR" code.
   *
   * @example
   * ```js
   * throw new UnauthorizedException()
   * ```
   */
  public constructor(message = 'Unauthorized error happened.', help = null) {
    super({ help, message, status: 401, code: 'E_UNAUTHORIZED_ERROR' })
  }
}
