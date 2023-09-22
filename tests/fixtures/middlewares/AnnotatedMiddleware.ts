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

@Middleware({ name: 'middleware', type: 'singleton', alias: 'decoratedMiddleware', isGlobal: false })
export class AnnotatedMiddleware implements MiddlewareContract {
  public handle(ctx: Context): any {
    ctx.data.handled = true
  }
}
