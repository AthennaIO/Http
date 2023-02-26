import { Context } from '#src/Types/Contexts/Context'
import { Middleware } from '#src/Decorators/Middleware'
import { MiddlewareContract } from '#src/Contracts/MiddlewareContract'

@Middleware({ alias: 'importedMiddleware', isGlobal: false })
export class ImportedMiddleware implements MiddlewareContract {
  handle(ctx: Context): any {
    ctx.data.handled = true
  }
}
