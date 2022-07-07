/**
 * @athenna/logger
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class InternalServerException extends HttpException {
  /**
   * Creates a new instance of InternalServerException.
   *
   * @example
   *  throw new InternalServerException()
   *  This exception uses the 500 status code and the "E_INTERNAL_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(
    content = 'Internal server error',
    code = 'E_INTERNAL_ERROR',
    help = null,
  ) {
    super(content, 500, code, help)
  }
}
