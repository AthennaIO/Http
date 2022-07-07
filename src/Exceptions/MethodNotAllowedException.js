/**
 * @athenna/logger
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class MethodNotAllowedException extends HttpException {
  /**
   * Creates a new instance of MethodNotAllowedException.
   *
   * @example
   *  throw new MethodNotAllowedException()
   *  This exception uses the 405 status code and the "E_METHOD_NOT_ALLOWED_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(
    content = 'Method not allowed error',
    code = 'E_METHOD_NOT_ALLOWED_ERROR',
    help = null,
  ) {
    super(content, 405, code, help)
  }
}
