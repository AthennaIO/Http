/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class BadRequestException extends HttpException {
  /**
   * This exception uses the 400 status code and the "E_BAD_REQUEST_ERROR" code.
   *
   * @example
   * ```js
   * throw new BadRequestException()
   * ```
   */
  public constructor(message = 'Bad request error happened.', help = null) {
    super({ help, message, status: 400, code: 'E_BAD_REQUEST_ERROR' })
  }
}
