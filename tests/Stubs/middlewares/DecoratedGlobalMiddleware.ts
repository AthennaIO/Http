import { Context } from '#src/Types/Contexts/Context'
import { Middleware } from '#src/Decorators/Middleware'
import { MiddlewareContract } from '#src/Contracts/MiddlewareContract'

@Middleware({ type: 'singleton', alias: 'decoratedGlobalMiddleware', isGlobal: true })
export class DecoratedGlobalMiddleware implements MiddlewareContract {
  handle(ctx: Context): any {
    ctx.data.handled = true
  }
}
