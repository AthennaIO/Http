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

@Interceptor({ type: 'singleton', alias: 'decoratedGlobalInterceptor', isGlobal: true })
export class AnnotatedGlobalInterceptor implements InterceptorContract {
  public intercept(ctx: InterceptContext): unknown {
    ctx.response.body.intercepted = true

    return ctx.response.body
  }
}
