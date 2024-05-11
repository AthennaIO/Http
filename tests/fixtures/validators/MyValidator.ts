/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Context, MiddlewareContract } from '#src/types'

export class MyValidator implements MiddlewareContract {
  public handle(ctx: Context): any {
    ctx.data.handled = true
  }
}
