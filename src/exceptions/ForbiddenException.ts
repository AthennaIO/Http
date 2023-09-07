/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/exceptions/HttpException'

export class ForbiddenException extends HttpException {
  /**
   * This exception uses the 403 status code and the "E_FORBIDDEN_ERROR" code.
   *
   * @example
   * ```js
   * throw new ForbiddenException()
   * ```
   */
  public constructor(
    message = 'Forbidden request error happened.',
    help = null
  ) {
    super({ help, message, status: 403, code: 'E_FORBIDDEN_ERROR' })
  }
}
