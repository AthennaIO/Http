/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from '#src/exceptions/HttpException'

export class InvalidFilterException extends HttpException {
  /**
   * This exception uses the 422 status code and the "E_INVALID_FILTER" code.
   * It is thrown by `request.filters()` when the client sends a field,
   * operator or relation that is not allowed in a query string parameter.
   *
   * @example
   * ```js
   * throw new InvalidFilterException('where', 'password')
   * ```
   */
  public constructor(parameter: string, value: string, help?: string) {
    super({
      status: 422,
      code: 'E_INVALID_FILTER',
      message: `The value "${value}" is not allowed in the "${parameter}" query parameter.`,
      help:
        help ||
        `Remove "${value}" from the "${parameter}" query parameter or ask for it to be allowed in this route.`
    })
  }
}
