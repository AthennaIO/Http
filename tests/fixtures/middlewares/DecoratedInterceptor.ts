/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Interceptor } from '#src'
import type { InterceptContext, InterceptorContract } from '#src/types'

@Interceptor({ name: 'interceptor', type: 'singleton', alias: 'decoratedInterceptor', isGlobal: false })
export class DecoratedInterceptor implements InterceptorContract {
  intercept(ctx: InterceptContext): unknown {
    ctx.body.intercepted = true

    return ctx.body
  }
}
