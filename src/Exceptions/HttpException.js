/**
 * @athenna/logger
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class HttpException extends Exception {
  /**
   * Creates a new instance of HttpException.
   *
   * @example
   *  throw new HttpException()
   *  This exception uses the 500 status code and the "E_HTTP_ERROR" code.
   *
   * @param {string} [content]
   * @param {number} [status]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(
    content = 'Http error',
    status = 500,
    code = 'E_HTTP_ERROR',
    help = null,
  ) {
    super(content, status, code, help)
  }
}
