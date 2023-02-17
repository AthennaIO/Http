import { InterceptContext } from '#src/Types/Contexts/InterceptContext'
import { InterceptorContract } from '#src/Contracts/Middlewares/InterceptorContract'

export class Interceptor implements InterceptorContract {
  intercept(ctx: InterceptContext): unknown {
    ctx.body.intercepted = true

    return ctx.body
  }
}
