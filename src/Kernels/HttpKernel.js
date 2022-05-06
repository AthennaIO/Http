import { Log } from '@athenna/logger'
import { Config, Exec, Path, Uuid } from '@secjs/utils'

import { Server } from '#src/Facades/Server'

export class HttpKernel {
  /**
   * The application's global HTTP middlewares.
   *
   * This middlewares are run during every request to your http server.
   *
   * @type {any | Promise<any>}
   */
  globalMiddlewares

  /**
   * The application's named HTTP middlewares.
   *
   * Here you define all your named middlewares to use inside routes/http file.
   *
   * @type {Record<string, any | Promise<any>>}
   */
  namedMiddlewares

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
      const Middleware = await Exec.getModule(this.namedMiddlewares[key])

      if (!ioc.hasDependency(`App/Http/Middlewares/${Middleware.name}`)) {
        ioc.bind(`App/Http/Middlewares/${Middleware.name}`, Middleware)
      }

      ioc.alias(
        `App/Http/Middlewares/Names/${key}`,
        `App/Http/Middlewares/${Middleware.name}`,
      )
    }

    /**
     * Binding the global middlewares inside the container and
     * resolving it inside the Http server using "use" method.
     */
    for (const module of this.globalMiddlewares) {
      let Middleware = await Exec.getModule(module)

      if (!ioc.hasDependency(`App/Http/Middlewares/${Middleware.name}`)) {
        ioc.bind(`App/Http/Middlewares/${Middleware.name}`, Middleware)
      }

      Middleware = ioc.safeUse(`App/Http/Middlewares/${Middleware.name}`)

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
   * Register cors plugin.
   *
   * @return {Promise<void>}
   */
  async registerCors() {
    if (Config.get('http.noCors')) {
      return
    }

    Server.registerCors(Config.get('http.cors'))
  }

  /**
   * Register rate limit plugin.
   *
   * @return {Promise<void>}
   */
  async registerRateLimit() {
    if (Config.get('http.noRateLimit')) {
      return
    }

    Server.registerRateLimit(Config.get('http.rateLimit'))
  }

  /**
   * Register the default error handler.
   *
   * @return {Promise<void>}
   */
  async registerErrorHandler() {
    if (Config.get('http.noErrorHandler')) {
      return
    }

    const path = Path.app(`Http/Exceptions/Handler.js`)

    const Handler = await Exec.getModule(import(path))
    const handler = new Handler()

    Server.setErrorHandler(handler.handle.bind(handler))
  }

  /**
   * Register log terminate middleware.
   *
   * @return {Promise<void>}
   */
  async registerLogMiddleware() {
    if (!Config.get('http.logRequests')) {
      return
    }

    Server.use(async ctx => {
      await Log.channel('request').info(ctx)

      return ctx.next()
    }, 'terminate')
  }

  /**
   * Register the requestId handle middleware.
   *
   * @return {Promise<void>}
   */
  async registerRequestIdMiddleware() {
    if (Config.get('http.noRequestId')) {
      return
    }

    Server.use(async ctx => {
      ctx.data.requestId = Uuid.generate('ath')

      return ctx.next()
    }, 'handle')
  }
}
