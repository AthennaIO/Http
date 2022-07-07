/**
 * @athenna/logger
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class NotFoundException extends HttpException {
  /**
   * Creates a new instance of NotFoundException.
   *
   * @example
   *  throw new NotFoundException()
   *  This exception uses the 404 status code and the "E_NOT_FOUND_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(
    content = 'Not found error',
    code = 'E_NOT_FOUND_ERROR',
    help = null,
  ) {
    super(content, 404, code, help)
  }
}
