/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { InterceptContext, InterceptorContract } from '#src/types'

export class MyInterceptor implements InterceptorContract {
  public intercept(ctx: InterceptContext): unknown {
    ctx.body.intercepted = true

    return ctx.body
  }
}
