/**
 * @athenna/logger
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class UnprocessableEntityException extends HttpException {
  /**
   * Creates a new instance of UnprocessableEntityException.
   *
   * @example
   *  throw new UnprocessableEntityException()
   *  This exception uses the 422 status code and the "E_UNPROCESSABLE_ENTITY_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(
    content = 'Unprocessable entity error',
    code = 'E_UNPROCESSABLE_ENTITY_ERROR',
    help = null,
  ) {
    super(content, 422, code, help)
  }
}
