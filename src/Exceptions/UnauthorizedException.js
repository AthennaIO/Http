/**
 * @athenna/logger
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class UnauthorizedException extends HttpException {
  /**
   * Creates a new instance of UnauthorizedException.
   *
   * @example
   *  throw new UnauthorizedException()
   *  This exception uses the 401 status code and the "E_UNAUTHORIZED_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(
    content = 'Unauthorized error',
    code = 'E_UNAUTHORIZED_ERROR',
    help = null,
  ) {
    super(content, 401, code, help)
  }
}
