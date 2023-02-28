/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { InterceptContext } from '#src/Types/Contexts/InterceptContext'

export interface InterceptorContract {
  /**
   * Intercept the request at the end, before returning the response.
   */
  intercept(ctx: InterceptContext): unknown | Promise<unknown>
}
