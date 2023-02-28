/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { InterceptContext, Interceptor, InterceptorContract } from '#src'

@Interceptor({ type: 'singleton', alias: 'decoratedGlobalInterceptor', isGlobal: true })
export class DecoratedGlobalInterceptor implements InterceptorContract {
  intercept(ctx: InterceptContext): unknown {
    ctx.body.intercepted = true

    return ctx.body
  }
}
