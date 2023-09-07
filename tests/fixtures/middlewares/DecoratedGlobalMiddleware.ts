/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Middleware } from '#src'
import type { Context, MiddlewareContract } from '#src/types'

@Middleware({ type: 'singleton', alias: 'decoratedGlobalMiddleware', isGlobal: true })
export class DecoratedGlobalMiddleware implements MiddlewareContract {
  handle(ctx: Context): any {
    ctx.data.handled = true
  }
}
