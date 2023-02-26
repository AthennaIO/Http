import { Context } from '#src/Types/Contexts/Context'
import { MiddlewareContract } from '#src/Contracts/MiddlewareContract'

export class Middleware implements MiddlewareContract {
  handle(ctx: Context): any {
    ctx.data.handled = true
  }
}
