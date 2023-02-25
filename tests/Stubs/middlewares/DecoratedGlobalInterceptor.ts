import { InterceptContext, Interceptor, InterceptorContract } from '#src'

@Interceptor({ type: 'singleton', alias: 'decoratedGlobalInterceptor', isGlobal: true })
export class DecoratedGlobalInterceptor implements InterceptorContract {
  intercept(ctx: InterceptContext): unknown {
    ctx.body.intercepted = true

    return ctx.body
  }
}
