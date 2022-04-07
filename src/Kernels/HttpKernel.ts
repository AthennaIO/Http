import { Http } from 'src/Http'
import { Config } from '@athenna/config'
import { Logger } from '@athenna/logger'
import { HttpErrorHandler } from 'src/Handlers/HttpErrorHandler'
import { MiddlewareContract } from '../Contracts/MiddlewareContract'
import { InterceptContextContract } from 'src/Contracts/Context/Middlewares/Intercept/InterceptContextContract'

export type MiddlewareContractClass = {
  new (container?: any): MiddlewareContract
}

export abstract class HttpKernel {
  /**
   * The application's global HTTP middlewares.
   *
   * This middlewares are run during every request to your http server.
   */
  protected abstract globalMiddlewares:
    | MiddlewareContractClass[]
    | Promise<any>[]

  /**
   * The application's named HTTP middlewares.
   *
   * Here you define all your named middlewares to use inside routes/http file.
   */
  protected abstract namedMiddlewares: Record<
    string,
    Promise<any>[] | MiddlewareContractClass
  >

  /**
   * Returns an instance of any class that extends HttpKernel.
   * Also configure the error handler, detect environment and
   * configure log intercept middleware for requests.
   *
   * @protected
   */
  protected constructor() {
    const httpServer = ioc.safeUse<Http>('Athenna/Core/HttpServer')

    httpServer.setErrorHandler(HttpErrorHandler.handler)

    if (Config.get<boolean>('http.log')) {
      httpServer.use(async (ctx: InterceptContextContract) => {
        await new Logger().channel('requests').log(ctx)

        return ctx.body
      }, 'intercept')
    }
  }
}
