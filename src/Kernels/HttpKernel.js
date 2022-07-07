import { Log } from '@athenna/logger'
import { Config, Module, Path, Uuid } from '@secjs/utils'

import { Server } from '#src/Facades/Server'

export class HttpKernel {
  /**
   * The application's global HTTP middlewares.
   *
   * This middlewares are run during every request to your http server.
   *
   * @return {any[] | Promise<any[]>}
   */
  get globalMiddlewares() {
    return []
  }

  /**
   * The application's named HTTP middlewares.
   *
   * Here you define all your named middlewares to use inside routes/http file.
   *
   * @return {Record<string, any | Promise<any>>}
   */
  get namedMiddlewares() {
    return {}
  }

  /**
   * Register all global and named middlewares to the server.
   *
   * @return void
   */
  async registerMiddlewares() {
    const subAlias = 'App/Http/Middlewares'

    /**
     * Binding the named middlewares inside the container and
     * creating a simple alias to use it inside Route.
     */
    for (const key of Object.keys(this.namedMiddlewares)) {
      const midModule = this.namedMiddlewares[key]

      const { alias, module } = await Module.getWithAlias(midModule, subAlias)

      if (!ioc.hasDependency(alias)) {
        ioc.bind(alias, module)
      }

      ioc.alias(`App/Http/Middlewares/Names/${key}`, alias)
    }

    /**
     * Binding the global middlewares inside the container and
     * resolving it inside the Http server using "use" method.
     */
    for (const midModule of this.globalMiddlewares) {
      const { alias, module } = await Module.getWithAlias(midModule, subAlias)

      if (!ioc.hasDependency(alias)) {
        ioc.bind(alias, module)
      }

      const Middleware = ioc.safeUse(alias)

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

    const Handler = await Module.getFrom(Path.http('Exceptions/Handler.js'))

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
