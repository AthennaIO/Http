/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

import { Server } from '#src'
import { debug } from '#src/debug'
import { Log } from '@athenna/logger'
import { Config } from '@athenna/config'
import { sep, isAbsolute, resolve } from 'node:path'
import { Annotation, type ServiceMeta } from '@athenna/ioc'
import { File, Path, Module, String } from '@athenna/common'
import { HttpExceptionHandler } from '#src/handlers/HttpExceptionHandler'

export class HttpKernel {
  /**
   * Register the @fastify/cors plugin in the Http server.
   */
  public async registerCors(): Promise<void> {
    const corsPlugin = await Module.safeImport('@fastify/cors')

    if (Config.is('http.cors.enabled', false)) {
      debug(
        'Not able to register cors plugin. Set the http.cors.enabled configuration as true.'
      )

      return
    }

    if (!corsPlugin) {
      debug('Not able to register cors plugin. Install @fastify/cors package.')

      return
    }

    await Server.plugin(corsPlugin, this.getConfig('http.cors'))
  }

  /**
   * Register the @fastify/helmet plugin in the Http server.
   */
  public async registerHelmet(): Promise<void> {
    const helmetPlugin = await Module.safeImport('@fastify/helmet')

    if (Config.is('http.helmet.enabled', false)) {
      debug(
        'Not able to register helmet plugin. Set the http.helmet.enabled configuration as true.'
      )

      return
    }

    if (!helmetPlugin) {
      debug(
        'Not able to register helmet plugin. Install @fastify/helmet package.'
      )

      return
    }

    await Server.plugin(helmetPlugin, this.getConfig('http.helmet'))
  }

  /**
   * Register the @fastify/swagger plugin in the Http server.
   */
  public async registerSwagger(): Promise<void> {
    const swaggerPlugin = await Module.safeImport('@fastify/swagger')
    const swaggerUiPlugin = await Module.safeImport('@fastify/swagger-ui')

    if (Config.is('http.swagger.enabled', false)) {
      debug(
        'Not able to register swagger plugin. Set the http.swagger.enabled configuration as true.'
      )

      return
    }

    if (swaggerPlugin) {
      await Server.plugin(
        swaggerPlugin,
        Config.get('http.swagger.configurations')
      )
    } else {
      debug(
        'Not able to register swagger plugin. Install @fastify/swagger package.'
      )
    }

    if (swaggerUiPlugin) {
      const swaggerUiConfig = Config.get('http.swagger.ui', {})

      if (!swaggerUiConfig.logo) {
        const __dirname = Module.createDirname(import.meta.url)
        const image = new File(
          resolve(
            __dirname,
            '..',
            '..',
            'resources',
            'images',
            'athenna-logo.png'
          )
        )

        swaggerUiConfig.logo = {
          type: 'image/png',
          content: image.getContentSync()
        }
      }

      await Server.plugin(swaggerUiPlugin, swaggerUiConfig)
    } else {
      debug(
        'Not able to register swagger-ui plugin. Install @fastify/swagger-ui package.'
      )
    }
  }

  /**
   * Register the @fastify/rate-limit plugin in the Http server.
   */
  public async registerRateLimit(): Promise<void> {
    const rateLimitPlugin = await Module.safeImport('@fastify/rate-limit')

    if (Config.is('http.rateLimit.enabled', false)) {
      debug(
        'Not able to register rate limit plugin. Set the http.rateLimit.enabled configuration as true.'
      )

      return
    }

    if (!rateLimitPlugin) {
      debug(
        'Not able to register rate limit plugin. Install @fastify/rate-limit package.'
      )

      return
    }

    await Server.plugin(rateLimitPlugin, this.getConfig('http.rateLimit'))
  }

  /**
   * Register the @fastify/static plugin in the Http server.
   */
  public async registerStatic(): Promise<void> {
    const staticPlugin = await Module.safeImport('@fastify/static')

    if (Config.is('http.static.enabled', false)) {
      debug(
        'Not able to register static plugin. Set the http.static.enabled configuration as true.'
      )

      return
    }

    if (!staticPlugin) {
      debug(
        'Not able to register static plugin. Install @fastify/static package.'
      )

      return
    }

    await Server.plugin(staticPlugin, this.getConfig('http.static'))
  }

  /**
   * Register the cls-rtracer plugin in the Http server.
   */
  public async registerRTracer(): Promise<void> {
    const rTracerPlugin = await Module.safeImport('cls-rtracer')

    if (Config.is('http.rTracer.enabled', false)) {
      debug(
        'Not able to register rTracer plugin. Set the http.rTracer.enabled configuration as true.'
      )

      return
    }

    if (!rTracerPlugin) {
      debug('Not able to register tracer plugin. Install cls-rtracer package.')

      return
    }

    Server.middleware(async ctx => (ctx.data.traceId = rTracerPlugin.id()))

    await Server.plugin(
      rTracerPlugin.fastifyPlugin,
      this.getConfig('http.rTracer')
    )
  }

  /**
   * Register the @athenna/vite plugin in the Http server.
   */
  public async registerVite(): Promise<void> {
    const vitePlugin = await Module.safeImport('@athenna/vite/plugins/fastify')

    if (Config.is('http.vite.enabled', false)) {
      debug(
        'Not able to register vite plugin. Set the http.vite.enabled configuration as true.'
      )

      return
    }

    if (!vitePlugin) {
      debug('Not able to register vite plugin. Install @athenna/vite package.')

      return
    }

    await Server.plugin(vitePlugin, this.getConfig('http.vite'))
  }

  /**
   * Register the @fastify/multipart plugin in the Http server.
   */
  public async registerMultipart(): Promise<void> {
    const multipartPlugin = await Module.safeImport('@fastify/multipart')

    if (Config.is('http.multipart.enabled', false)) {
      debug(
        'Not able to register multipart plugin. Set the http.multipart.enabled configuration as true.'
      )

      return
    }

    if (!multipartPlugin) {
      debug(
        'Not able to register multipart plugin. Install @fastify/multipart package.'
      )

      return
    }

    await Server.plugin(multipartPlugin, this.getConfig('http.multipart'))
  }

  /**
   * Register the global log terminator in the Http server.
   */
  public async registerLoggerTerminator(): Promise<void> {
    if (Config.is('http.logger.enabled', false)) {
      debug(
        'Not able to register http request logger. Enable it in your http.logger.enabled configuration.'
      )

      return
    }

    const channel = Config.get('http.logger.channel', 'request')
    const isToLogRequest = Config.get('http.logger.isToLogRequest')

    Server.terminate(ctx => {
      if (!isToLogRequest) {
        return Log.channelOrVanilla(channel).info(ctx)
      }

      if (isToLogRequest(ctx)) {
        return Log.channelOrVanilla(channel).info(ctx)
      }
    })
  }

  /**
   * Register all the controllers found inside "rc.controllers" config
   * inside the service provider.
   */
  public async registerControllers(): Promise<void> {
    const controllers = Config.get<string[]>('rc.controllers', [])

    await controllers.athenna.concurrently(async path => {
      const Controller = await Module.resolve(path, this.getMeta())

      if (Annotation.isAnnotated(Controller)) {
        this.registerUsingMeta(Controller)

        return
      }

      ioc.transient(`App/Http/Controllers/${Controller.name}`, Controller)
    })
  }

  /**
   * Register all the middlewares found inside "rc.middlewares" config
   * inside the service provider. Also register if "rc.namedMiddlewares"
   * and "rc.globalMiddlewares" exists.
   */
  public async registerMiddlewares(): Promise<void> {
    const middlewares = Config.get<string[]>('rc.middlewares', [])

    await middlewares.athenna.concurrently(async path => {
      const Middleware = await Module.resolve(path, this.getMeta())

      if (Annotation.isAnnotated(Middleware)) {
        this.registerUsingMeta(Middleware)

        return
      }

      const alias = `App/Http/Middlewares/${Middleware.name}`
      const namedAlias = `App/Http/Middlewares/Names/${String.toCamelCase(
        Middleware.name
      )}`

      ioc.transient(alias, Middleware).alias(namedAlias, alias)
    })

    await this.registerNamedMiddlewares()
    await this.registerGlobalMiddlewares()
  }

  /**
   * Register all the named middlewares found inside "rc.namedMiddlewares"
   * property.
   */
  public async registerNamedMiddlewares(): Promise<void> {
    const namedMiddlewares = Config.get<Record<string, string>>(
      'rc.namedMiddlewares',
      {}
    )

    await Object.keys(namedMiddlewares).athenna.concurrently(async key => {
      const Middleware = await Module.resolve(
        namedMiddlewares[key],
        this.getMeta()
      )

      if (Annotation.isAnnotated(Middleware)) {
        this.registerUsingMeta(Middleware)

        return
      }

      const { alias, namedAlias } = this.getNamedMiddlewareAlias(
        key,
        Middleware
      )

      ioc.bind(alias, Middleware).alias(namedAlias, alias)
    })
  }

  /**
   * Register all the named middlewares found inside "rc.globalMiddlewares"
   * property.
   */
  public async registerGlobalMiddlewares(): Promise<void> {
    const globalMiddlewares = Config.get<string[]>('rc.globalMiddlewares', [])

    await globalMiddlewares.athenna.concurrently(async path => {
      const Middleware = await Module.resolve(path, this.getMeta())

      if (Annotation.isAnnotated(Middleware)) {
        this.registerUsingMeta(Middleware)

        return
      }

      const { alias, handler, serverMethod } =
        this.getGlobalMiddlewareAliasAndHandler(Middleware)

      ioc.bind(alias, Middleware)

      Server[serverMethod]((...args: any[]) => {
        const mid = ioc.safeUse(alias)

        return mid[handler].bind(mid)(...args)
      })
    })
  }

  /**
   * Register the exception handler for all request handlers.
   */
  public async registerExceptionHandler(path?: string): Promise<void> {
    if (!path) {
      debug(
        'No custom exception handler path provided for HttpKernel. Using the default one.'
      )

      const handler = new HttpExceptionHandler()

      Server.setErrorHandler(handler.handle.bind(handler))

      return
    }

    const Handler = await Module.resolve(path, this.getMeta())

    debug('Using custom exception handler %s in HttpKernel.', Handler.name)

    const handler = new Handler()

    Server.setErrorHandler(handler.handle.bind(handler))
  }

  /**
   * Register the route file by importing the file.
   */
  public async registerRoutes(path: string) {
    if (path.startsWith('#')) {
      await Module.resolve(path, this.getMeta())

      return
    }

    if (!isAbsolute(path)) {
      path = resolve(path)
    }

    if (!(await File.exists(path))) {
      return
    }

    await Module.resolve(path, this.getMeta())
  }

  /**
   * Fabricate the named middlewares aliases.
   */
  private getNamedMiddlewareAlias(name: string, Middleware: any) {
    const middleware = new Middleware()

    if (middleware.handle) {
      return {
        alias: `App/Http/Middlewares/${Middleware.name}`,
        namedAlias: `App/Http/Middlewares/Names/${name}`
      }
    }

    if (middleware.intercept) {
      return {
        alias: `App/Http/Interceptors/${Middleware.name}`,
        namedAlias: `App/Http/Interceptors/Names/${name}`
      }
    }

    if (middleware.terminate) {
      return {
        alias: `App/Http/Terminators/${Middleware.name}`,
        namedAlias: `App/Http/Terminators/Names/${name}`
      }
    }
  }

  /**
   * Fabricate the global middlewares alias and resolve the handler and
   * server methods.
   */
  private getGlobalMiddlewareAliasAndHandler(Middleware: any) {
    const middleware = new Middleware()

    if (middleware.handle) {
      return {
        handler: 'handle',
        serverMethod: 'middleware',
        alias: `App/Http/Middlewares/${Middleware.name}`
      }
    }

    if (middleware.intercept) {
      return {
        handler: 'intercept',
        serverMethod: 'intercept',
        alias: `App/Http/Interceptors/${Middleware.name}`
      }
    }

    if (middleware.terminate) {
      return {
        handler: 'terminate',
        serverMethod: 'terminate',
        alias: `App/Http/Terminators/${Middleware.name}`
      }
    }
  }

  /**
   * Register the controllers using the meta information
   * defined by annotations.
   */
  private registerUsingMeta(target: any): ServiceMeta {
    const meta = Annotation.getMeta(target)

    ioc[meta.type](meta.alias, target)

    if (meta.name && !meta.isGlobal) {
      ioc.alias(meta.name, meta.alias)
    }

    if (meta.camelAlias) {
      ioc.alias(meta.camelAlias, meta.alias)
    }

    if (meta.isGlobal) {
      const { handler, serverMethod } =
        this.getGlobalMiddlewareAliasAndHandler(target)

      Server[serverMethod]((...args: any[]) => {
        const mid = ioc.safeUse(meta.alias)

        return mid[handler].bind(mid)(...args)
      })
    }

    return meta
  }

  /**
   * Get the configuration for the given key.
   */
  private getConfig(key: string): any {
    const config = Config.get(key)

    if (Config.exists(`${key}.enabled`)) {
      delete config.enabled
    }

    return config
  }

  /**
   * Get the meta URL of the project.
   */
  private getMeta() {
    return Config.get('rc.parentURL', Path.toHref(Path.pwd() + sep))
  }
}
