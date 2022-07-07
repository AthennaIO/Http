/**
 * @athenna/logger
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class ForbiddenException extends HttpException {
  /**
   * Creates a new instance of ForbiddenException.
   *
   * @example
   *  throw new ForbiddenException()
   *  This exception uses the 403 status code and the "E_FORBIDDEN_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(
    content = 'Forbidden error',
    code = 'E_FORBIDDEN_ERROR',
    help = null,
  ) {
    super(content, 403, code, help)
  }
}
