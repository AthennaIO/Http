import { Http } from 'src/Http'
import { Config } from '@athenna/config'
import { Logger } from '@athenna/logger'
import { resolveModule } from '@secjs/utils'
import { HttpErrorHandler } from 'src/Handlers/HttpErrorHandler'
import { MiddlewareContract } from '../Contracts/MiddlewareContract'
import { TerminateContextContract } from 'src/Contracts/Context/Middlewares/Terminate/TerminateContextContract'

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
    Promise<any> | MiddlewareContractClass
  >

  /**
   * Returns an instance of any class that extends HttpKernel.
   * Also configure the error handler, detect environment and
   * configure log intercept middleware for requests.
   *
   * @return HttpKernel
   */
  constructor() {
    const httpServer = ioc.safeUse<Http>('Athenna/Core/HttpServer')

    httpServer.setErrorHandler(HttpErrorHandler.handler)

    if (Config.get<boolean>('http.log')) {
      httpServer.use(async (ctx: TerminateContextContract) => {
        await new Logger().channel('request').log(ctx)

        return ctx.body
      }, 'terminate')
    }
  }

  /**
   * Register all global and named middlewares to the server.
   *
   * @return void
   */
  async registerMiddlewares() {
    const httpServer = ioc.safeUse<Http>('Athenna/Core/HttpServer')

    /**
     * Binding the named middlewares inside the container and
     * creating a simple alias to use it inside Route.
     */
    for (const key of Object.keys(this.namedMiddlewares)) {
      const Middleware = resolveModule(await this.namedMiddlewares[key])

      if (!ioc.hasDependency(`App/Middlewares/${Middleware.name}`)) {
        ioc.bind(`App/Middlewares/${Middleware.name}`, Middleware)
      }

      ioc.alias(
        `App/Middlewares/Names/${key}`,
        `App/Middlewares/${Middleware.name}`,
      )
    }

    /**
     * Binding the global middlewares inside the container and
     * resolving it inside the Http server using "use" method.
     */
    for (const module of this.globalMiddlewares) {
      let Middleware = resolveModule(await module)

      if (!ioc.hasDependency(`App/Middlewares/${Middleware.name}`)) {
        ioc.bind(`App/Middlewares/${Middleware.name}`, Middleware)
      }

      Middleware = ioc.safeUse(`App/Middlewares/${Middleware.name}`)

      if (Middleware.handle) {
        httpServer.use(Middleware.handle, 'handle')
      }

      if (Middleware.intercept) {
        httpServer.use(Middleware.intercept, 'intercept')
      }

      if (Middleware.terminate) {
        httpServer.use(Middleware.terminate, 'terminate')
      }
    }
  }
}
