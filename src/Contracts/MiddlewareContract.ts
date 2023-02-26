/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Context } from '#src/Types/Contexts/Context'

export interface MiddlewareContract {
  /**
   * Handle the request before going to the route handler.
   */
  handle(ctx: Context): any | Promise<any>
}
