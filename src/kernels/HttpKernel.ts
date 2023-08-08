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
import { isAbsolute, resolve } from 'node:path'
import { File, Exec, Is, Module } from '@athenna/common'
import { HttpExceptionHandler } from '#src/handlers/HttpExceptionHandler'

const corsPlugin = await Module.safeImport('@fastify/cors')
const helmetPlugin = await Module.safeImport('@fastify/helmet')
const swaggerPlugin = await Module.safeImport('@fastify/swagger')
const swaggerUiPlugin = await Module.safeImport('@fastify/swagger-ui')
const rateLimitPlugin = await Module.safeImport('@fastify/rate-limit')
const rTracerPlugin = await Module.safeImport('cls-rtracer')

export class HttpKernel {
  /**
   * Register the @fastify/cors plugin in the Http server.
   */
  public async registerCors(): Promise<void> {
    if (!corsPlugin) {
      debug('Not able to register cors plugin. Install @fastify/cors package.')

      return
    }

    await Server.plugin(corsPlugin, Config.get('http.cors'))
  }

  /**
   * Register the @fastify/helmet plugin in the Http server.
   */
  public async registerHelmet(): Promise<void> {
    if (!helmetPlugin) {
      debug(
        'Not able to register helmet plugin. Install @fastify/helmet package.',
      )

      return
    }

    await Server.plugin(helmetPlugin, Config.get('http.helmet'))
  }

  /**
   * Register the @fastify/swagger plugin in the Http server.
   */
  public async registerSwagger(): Promise<void> {
    if (swaggerPlugin) {
      debug(
        'Not able to register swagger plugin. Install @fastify/swagger package.',
      )

      await Server.plugin(
        swaggerPlugin,
        Config.get('http.swagger.configurations'),
      )
    }

    if (swaggerUiPlugin) {
      debug(
        'Not able to register swagger-ui plugin. Install @fastify/swagger-ui package.',
      )

      await Server.plugin(swaggerUiPlugin, Config.get('http.swagger.ui'))
    }
  }

  /**
   * Register the @fastify/rate-limit plugin in the Http server.
   */
  public async registerRateLimit(): Promise<void> {
    if (!rateLimitPlugin) {
      debug(
        'Not able to register rate limit plugin. Install @fastify/rate-limit package.',
      )

      return
    }

    await Server.plugin(rateLimitPlugin, Config.get('http.rateLimit'))
  }

  /**
   * Register the cls-rtracer plugin in the Http server.
   */
  public async registerRTracer(trace?: boolean): Promise<void> {
    if (trace === false) {
      return
    }

    if (!rTracerPlugin) {
      debug('Not able to register tracer plugin. Install cls-rtracer package.')

      return
    }

    Server.middleware(async ctx => (ctx.data.traceId = rTracerPlugin.id()))

    await Server.plugin(rTracerPlugin.fastifyPlugin, Config.get('http.rTracer'))
  }

  /**
   * Register the global log terminator in the Http server.
   */
  public async registerLoggerTerminator(): Promise<void> {
    if (
      !Config.exists('http.logger.enabled') ||
      Config.is('http.logger.enabled', false)
    ) {
      debug(
        'Not able to register http request logger. Enable it in your http.logger.enabled configuration.',
      )

      return
    }

    Server.terminate(ctx => Log.channelOrVanilla('request').info(ctx))
  }

  /**
   * Register all the controllers found inside "rc.controllers" config
   * inside the service provider.
   */
  public async registerControllers(): Promise<void> {
    const controllers = Config.get<string[]>('rc.controllers', [])

    await Exec.concurrently(controllers, async path => {
      const Controller = await this.resolvePath(path)

      if (Reflect.hasMetadata('provider:registered', Controller)) {
        debug(
          'Controller %s already registered by Controller annotation. Skipping registration via HttpKernel.',
          Controller.name,
        )

        return
      }

      const createCamelAlias = false
      const alias = `App/Http/Controllers/${Controller.name}`

      ioc.bind(alias, Controller, createCamelAlias)
    })
  }

  /**
   * Register all the middlewares found inside "rc.middlewares" config
   * inside the service provider. Also register if "rc.namedMiddlewares"
   * and "rc.globalMiddlewares" exists.
   */
  public async registerMiddlewares(): Promise<void> {
    await this.registerNamedMiddlewares()
    await this.registerGlobalMiddlewares()

    if (Config.exists('rc.middlewares')) {
      await Exec.concurrently(Config.get('rc.middlewares'), this.resolvePath)
    }
  }

  /**
   * Register all the named middlewares found inside "rc.namedMiddlewares"
   * property.
   */
  public async registerNamedMiddlewares(): Promise<void> {
    const namedMiddlewares = Config.get<Record<string, string>>(
      'rc.namedMiddlewares',
    )

    if (Is.Empty(namedMiddlewares)) {
      return
    }

    await Exec.concurrently(Object.keys(namedMiddlewares), async key => {
      const Middleware = await this.resolvePath(namedMiddlewares[key])

      if (Reflect.hasMetadata('provider:registered', Middleware)) {
        debug(
          'Named middleware %s already registered by Middleware annotation. Skipping registration via HttpKernel.',
          Middleware.name,
        )

        return
      }

      const createCamelAlias = false
      const { alias, namedAlias } = this.getNamedMiddlewareAlias(
        key,
        Middleware,
      )

      ioc.bind(alias, Middleware, createCamelAlias).alias(namedAlias, alias)
    })
  }

  /**
   * Register all the named middlewares found inside "rc.globalMiddlewares"
   * property.
   */
  public async registerGlobalMiddlewares(): Promise<void> {
    const globalMiddlewares = Config.get<string[]>('rc.globalMiddlewares')

    if (Is.Empty(globalMiddlewares)) {
      return
    }

    await Exec.concurrently(globalMiddlewares, async path => {
      const Middleware = await this.resolvePath(path)

      if (Reflect.hasMetadata('provider:registered', Middleware)) {
        debug(
          'Global middleware %s already registered by Middleware annotation. Skipping registration via HttpKernel.',
          Middleware.name,
        )

        return
      }

      const createCamelAlias = false
      const { alias, handler, serverMethod } =
        this.getGlobalMiddlewareAliasAndHandler(Middleware)

      ioc.bind(alias, Middleware, createCamelAlias)

      Server[serverMethod](ioc.safeUse(alias)[handler])
    })
  }

  /**
   * Register the exception handler for all request handlers.
   */
  public async registerExceptionHandler(path?: string): Promise<void> {
    if (!path) {
      debug(
        'No custom exception handler path provided for HttpKernel. Using the default one.',
      )

      const handler = new HttpExceptionHandler()

      Server.setErrorHandler(handler.handle.bind(handler))

      return
    }

    const Handler = await this.resolvePath(path)

    debug('Using custom exception handler %s in HttpKernel.', Handler.name)

    const handler = new Handler()

    Server.setErrorHandler(handler.handle.bind(handler))
  }

  /**
   * Register the route file by importing the file.
   */
  public async registerRoutes(path: string) {
    if (path.startsWith('#')) {
      await this.resolvePath(path)

      return
    }

    if (!isAbsolute(path)) {
      path = resolve(path)
    }

    if (!(await File.exists(path))) {
      return
    }

    await this.resolvePath(path)
  }

  /**
   * Fabricate the named middlewares aliases.
   */
  private getNamedMiddlewareAlias(name: string, Middleware: any) {
    const middleware = new Middleware()

    if (middleware.handle) {
      return {
        alias: `App/Http/Middlewares/${Middleware.name}`,
        namedAlias: `App/Http/Middlewares/Names/${name}`,
      }
    }

    if (middleware.intercept) {
      return {
        alias: `App/Http/Interceptors/${Middleware.name}`,
        namedAlias: `App/Http/Interceptors/Names/${name}`,
      }
    }

    if (middleware.terminate) {
      return {
        alias: `App/Http/Terminators/${Middleware.name}`,
        namedAlias: `App/Http/Terminators/Names/${name}`,
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
        alias: `App/Http/Middlewares/${Middleware.name}`,
      }
    }

    if (middleware.intercept) {
      return {
        handler: 'intercept',
        serverMethod: 'intercept',
        alias: `App/Http/Interceptors/${Middleware.name}`,
      }
    }

    if (middleware.terminate) {
      return {
        handler: 'terminate',
        serverMethod: 'terminate',
        alias: `App/Http/Terminators/${Middleware.name}`,
      }
    }
  }

  /**
   * Resolve the import path by meta URL and import it.
   */
  private resolvePath(path: string) {
    return Module.resolve(
      `${path}?version=${Math.random()}`,
      Config.get('rc.meta'),
    )
  }
}
