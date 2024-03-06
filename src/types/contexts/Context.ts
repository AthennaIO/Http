/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Request } from '#src/context/Request'
import type { Response } from '#src/context/Response'

export type Context = {
  /**
   * Retrieve any kind of data from your request by using the
   * request object.
   */
  request: Request
  /**
   * Return a response from the request using the response
   * object.
   */
  response: Response
  /**
   * Save any kind of data that will be shared in all of your
   * request flow. The data defined here will be available in
   * middlewares, route handlers, interceptors and terminators.
   */
  data: any
}

export type RequestHandler = (ctx: Context) => any | Promise<any>
