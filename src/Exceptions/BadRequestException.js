/**
 * @athenna/logger
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class BadRequestException extends HttpException {
  /**
   * Creates a new instance of BadRequestException.
   *
   * @example
   *  throw new BadRequestException()
   *  This exception uses the 400 status code and the "E_BAD_REQUEST_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(
    content = 'Bad request error',
    code = 'E_BAD_REQUEST_ERROR',
    help = null,
  ) {
    super(content, 400, code, help)
  }
}
