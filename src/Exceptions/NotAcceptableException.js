/**
 * @athenna/logger
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/Exceptions/HttpException'

export class NotAcceptableException extends HttpException {
  /**
   * Creates a new instance of NotAcceptableException.
   *
   * @example
   *  throw new NotAcceptableException()
   *  This exception uses the 406 status code and the "E_NOT_ACCEPTABLE_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(
    content = 'Not acceptable error',
    code = 'E_NOT_ACCEPTABLE_ERROR',
    help = null,
  ) {
    super(content, 406, code, help)
  }
}
