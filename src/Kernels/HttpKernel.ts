import { Log } from '@athenna/logger'
import { Config } from '@athenna/config'
import { resolveModule } from '@secjs/utils'
import { HttpErrorHandler } from 'src/Handlers/HttpErrorHandler'
import { MiddlewareContract } from '../Contracts/MiddlewareContract'
import { TerminateContextContract } from 'src/Contracts/Context/Middlewares/Terminate/TerminateContextContract'
import { Server } from 'src/Facades/Server'

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
   * Register all global and named middlewares to the server.
   *
   * @return void
   */
  async registerMiddlewares() {
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
        Server.use(Middleware.handle, 'handle')
      }

      if (Middleware.intercept) {
        Server.use(Middleware.intercept, 'intercept')
      }

      if (Middleware.terminate) {
        Server.use(Middleware.terminate, 'terminate')
      }
    }
  }

  /**
   * Register cors plugin
   *
   * @return void
   */
  async registerCors() {
    if (Config.get<boolean>('http.noCors')) {
      return
    }

    Server.registerCors(Config.get('http.cors'))
  }

  /**
   * Register rate limit plugin
   *
   * @return void
   */
  async registerRateLimit(): Promise<void> {
    if (Config.get<boolean>('http.noRateLimit')) {
      return
    }

    Server.registerRateLimit(Config.get('http.rateLimit'))
  }

  /**
   * Register the default error handler
   *
   * @return void
   */
  async registerErrorHandler(): Promise<void> {
    if (Config.get<boolean>('http.noErrorHandler')) {
      return
    }

    Server.setErrorHandler(HttpErrorHandler.handler)
  }

  /**
   * Register log terminate middleware
   *
   * @return void
   */
  async registerLogMiddleware(): Promise<void> {
    if (!Config.get<boolean>('http.logRequests')) {
      return
    }

    Server.use(async (ctx: TerminateContextContract) => {
      await Log.channel('request').log(ctx)

      return ctx.next()
    }, 'terminate')
  }
}
