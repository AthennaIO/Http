/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/exceptions/HttpException'

export class NotFoundException extends HttpException {
  /**
   * This exception uses the 404 status code and the "E_NOT_FOUND_ERROR" code.
   *
   * @example
   * ```js
   * throw new NotFoundException()
   * ```
   */
  public constructor(message = 'Not found error happened.', help = null) {
    super({ help, message, status: 404, code: 'E_NOT_FOUND_ERROR' })
  }
}
