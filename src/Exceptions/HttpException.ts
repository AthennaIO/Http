/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception, ExceptionJSON, Options } from '@athenna/common'

export class HttpException extends Exception {
  /**
   * This exception uses the 500 status code and the "E_HTTP_ERROR" code.
   *
   * @example
   * ```js
   * throw new HttpException()
   * ```
   */
  public constructor(options: ExceptionJSON = {}) {
    options = Options.create(options, {
      status: 500,
      code: 'E_HTTP_ERROR',
      message: 'An http exception has ocurred.',
    })

    super(options)
  }
}
