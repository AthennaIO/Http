/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Context } from '#src/Types/Contexts/Context'
import { InterceptContext } from '#src/Types/Contexts/InterceptContext'
import { TerminateContext } from '#src/Types/Contexts/TerminateContext'

export interface AthennaMiddleware {
  /**
   * Handle method is executed before going to the route (controller) handler.
   */
  handle(ctx: Context): Promise<void>

  /**
   * Intercept method is executed before the server returns the response. This means
   * that you can make modifications in the response body and return in the intercept
   * method to take effect.
   */
  intercept(
    ctx: InterceptContext,
  ): Promise<string | Record<string, any> | Record<string, any>[]>

  /**
   * Terminate method is executed after the server returns the response. This means
   * that you cannot make modifications in the response body anymore, but is very
   * useful for logging and to now how much time the request has taken to execute.
   */
  terminate(ctx: TerminateContext): Promise<void>
}
