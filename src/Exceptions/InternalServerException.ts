/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class InternalServerException extends HttpException {
  /**
   * This exception uses the 500 status code and the "E_INTERNAL_ERROR" code.
   *
   * @example
   * ```js
   * throw new InternalServerException()
   * ```
   */
  public constructor(message = 'Internal server error happened.', help = null) {
    super({ help, message, status: 500, code: 'E_INTERNAL_ERROR' })
  }
}
