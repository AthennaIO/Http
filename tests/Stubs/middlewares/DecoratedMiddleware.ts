import { Context } from '#src/Types/Contexts/Context'
import { Middleware } from '#src/Decorators/Middleware'
import { MiddlewareContract } from '#src/Contracts/MiddlewareContract'

@Middleware({ name: 'middleware', type: 'singleton', alias: 'decoratedMiddleware', isGlobal: false })
export class DecoratedMiddleware implements MiddlewareContract {
  handle(ctx: Context): any {
    ctx.data.handled = true
  }
}
