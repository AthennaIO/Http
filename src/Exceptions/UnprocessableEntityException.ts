/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class UnprocessableEntityException extends HttpException {
  /**
   * This exception uses the 422 status code and the "E_UNPROCESSABLE_ENTITY_ERROR" code.
   *
   * @example
   * ```js
   * throw new UnprocessableEntityException()
   * ```
   */
  public constructor(
    message = 'Unprocessable entity error happened.',
    help = null,
  ) {
    super({ help, message, status: 422, code: 'E_UNPROCESSABLE_ENTITY_ERROR' })
  }
}
