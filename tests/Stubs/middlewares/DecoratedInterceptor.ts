import { InterceptContext, Interceptor, InterceptorContract } from '#src'

@Interceptor({ name: 'interceptor', type: 'singleton', alias: 'decoratedInterceptor', isGlobal: false })
export class DecoratedInterceptor implements InterceptorContract {
  intercept(ctx: InterceptContext): unknown {
    ctx.body.intercepted = true

    return ctx.body
  }
}
