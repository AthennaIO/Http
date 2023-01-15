/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import rTracer from 'cls-rtracer'

import { Log, Logger } from '@athenna/logger'
import { Config } from '@athenna/config'
import { Server } from '#src/Facades/Server'
import { Module, Path } from '@athenna/common'

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
    if (Config.is('http.noCors', true)) {
      return
    }

    await Server.registerCors(Config.get('http.cors'))
  }

  /**
   * Register the rTracer plugin.
   *
   * @return {Promise<void>}
   */
  async registerTracer() {
    if (Config.is('http.noTracer', true)) {
      return
    }

    Server.use(async ctx => (ctx.data.traceId = rTracer.id()))

    await Server.registerTracer(Config.get('http.tracer'))
  }

  /**
   * Register helmet plugin.
   *
   * @return {Promise<void>}
   */
  async registerHelmet() {
    if (Config.is('http.noHelmet', true)) {
      return
    }

    await Server.registerHelmet(Config.get('http.helmet'))
  }

  /**
   * Register swagger plugin.
   *
   * @return {Promise<void>}
   */
  async registerSwagger() {
    if (Config.is('http.noSwagger', true)) {
      return
    }

    await Server.registerSwagger(Config.get('http.swagger'))
  }

  /**
   * Register rate limit plugin.
   *
   * @return {Promise<void>}
   */
  async registerRateLimit() {
    if (Config.is('http.noRateLimit', true)) {
      return
    }

    await Server.registerRateLimit(Config.get('http.rateLimit'))
  }

  /**
   * Register the default error handler.
   *
   * @return {Promise<void>}
   */
  async registerErrorHandler() {
    if (Config.is('http.noErrorHandler', true)) {
      return
    }

    const Handler = await Module.getFrom(
      Path.http(`Exceptions/Handler.${Path.ext()}`),
    )

    const handler = new Handler()

    Server.setErrorHandler(handler.handle.bind(handler))
  }

  /**
   * Register log terminate middleware.
   *
   * @return {Promise<void>}
   */
  async registerLogMiddleware() {
    if (Config.is('http.logRequests', false)) {
      return
    }

    Server.use(async ctx => {
      const logger = Config.exists('logging.channels.request')
        ? Log.channel('request')
        : Logger.getVanillaLogger({
            level: 'trace',
            driver: 'console',
            formatter: 'none',
          })

      logger.info(ctx)
    }, 'terminate')
  }
}
