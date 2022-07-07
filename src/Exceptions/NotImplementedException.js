/**
 * @athenna/logger
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class NotImplementedException extends HttpException {
  /**
   * Creates a new instance of NotImplementedException.
   *
   * @example
   *  throw new NotImplementedException()
   *  This exception uses the 501 status code and the "E_NOT_IMPLEMENTED_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(
    content = 'Not implemented error',
    code = 'E_NOT_IMPLEMENTED_ERROR',
    help = null,
  ) {
    super(content, 501, code, help)
  }
}
