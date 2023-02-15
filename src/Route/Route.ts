/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is, Options, Route as RouteHelper } from '@athenna/common'

import {
  HandleHandler,
  TerminateHandler,
  InterceptHandler,
  MiddlewareRecord,
  MiddlewareHandlerExt,
} from '#src/Types/Middlewares/MiddlewareHandler'

import { HTTPMethods, FastifySchema } from 'fastify'
import { SwaggerOptions } from '#src/Types/SwaggerOptions'
import { RequestHandler } from '#src/Types/Contexts/Context'
import { MiddlewareTypes } from '#src/Types/Middlewares/MiddlewareTypes'
import { UndefinedMethodException } from '#src/Exceptions/UndefinedMethodException'

export class Route {
  /**
   * Route name for resources.
   */
  public name: string

  /**
   * Route url.
   */
  private url: string

  /**
   * Sets if route should be registered or not.
   */
  private deleted: boolean

  /**
   * The route handler closure.
   */
  private handler: string | RequestHandler

  /**
   * The methods of this route.
   */
  private methods: HTTPMethods[]

  /**
   * The middlewares of this route.
   */
  private routeMiddlewares: MiddlewareRecord

  /**
   * The prefixes of this route.
   */
  private prefixes: string[]

  /**
   * Helmet options of this route.
   */
  private helmetOptions: import('@fastify/helmet').FastifyHelmetRouteOptions

  /**
   * Fastify schema options of this route.
   */
  private fastifySchema: FastifySchema

  /**
   * Rate limit options of this route.
   */
  private rateLimitOptions: import('@fastify/rate-limit').FastifyRateLimitOptions

  public constructor(
    url: string,
    methods: HTTPMethods[],
    handler: RequestHandler,
    name: string,
  ) {
    this.url = url
    this.deleted = false
    this.methods = methods
    this.prefixes = []
    this.handler = handler
    this.routeMiddlewares = { handlers: [], terminators: [], interceptors: [] }

    this.helmetOptions = {}
    this.fastifySchema = {}
    this.rateLimitOptions = {}

    RouteHelper.getParamsName(url).forEach(param => this.param(param))

    if (name) {
      this.name = name
    }
  }

  /**
   * Set a prefix for the route.
   */
  public prefix(prefix: string): Route {
    this.prefixes.push(prefix)

    return this
  }

  public middleware(
    middleware: HandleHandler,
    type: 'handle',
    prepend?: boolean,
  ): Route

  public middleware(
    middleware: InterceptHandler,
    type: 'intercept',
    prepend?: boolean,
  ): Route

  public middleware(
    middleware: TerminateHandler,
    type: 'terminate',
    prepend?: boolean,
  ): Route

  /**
   * Set a middleware for the route.
   */
  public middleware(
    middleware: MiddlewareHandlerExt,
    type: MiddlewareTypes = 'handle',
    prepend = false,
  ): Route {
    const dictionary = {
      handle: 'handlers',
      terminate: 'terminators',
      intercept: 'interceptors',
    }

    const insertionType = prepend ? 'unshift' : 'push'

    if (Is.String(middleware)) {
      const mid =
        ioc.use(`App/Http/Middlewares/Names/${middleware}`) ||
        ioc.safeUse(`App/Http/Middlewares/${middleware}`)

      if (mid.handle) {
        this.routeMiddlewares.handlers[insertionType](mid.handle.bind(mid))
      }

      if (mid.intercept) {
        this.routeMiddlewares.interceptors[insertionType](
          mid.intercept.bind(mid),
        )
      }

      if (mid.terminate) {
        this.routeMiddlewares.terminators[insertionType](
          mid.terminate.bind(mid),
        )
      }

      return this
    }

    if (Is.Function(middleware)) {
      this.routeMiddlewares[dictionary[type]][insertionType](middleware)

      return this
    }

    if (middleware.handle) {
      this.routeMiddlewares.handlers[insertionType](
        middleware.handle.bind(middleware),
      )
    }

    if (middleware.intercept) {
      this.routeMiddlewares.interceptors[insertionType](
        middleware.intercept.bind(middleware),
      )
    }

    if (middleware.terminate) {
      this.routeMiddlewares.terminators[insertionType](
        middleware.terminate.bind(middleware),
      )
    }

    return this
  }

  /**
   * Set up all helmet options for route.
   */
  public helmet(
    options: import('@fastify/helmet').FastifyHelmetRouteOptions,
    override = true,
  ): Route {
    if (!override) {
      this.helmetOptions = Options.create(this.helmetOptions, options)

      return this
    }

    this.helmetOptions = options

    return this
  }

  /**
   * Set up all swagger options for route.
   */
  public swagger(options: SwaggerOptions, override = true): Route {
    if (!override) {
      this.fastifySchema = Options.create(this.fastifySchema, options)

      return this
    }

    this.fastifySchema = options

    return this
  }

  /**
   * Set up all rate limit options for route.
   */
  public rateLimit(
    options: import('@fastify/rate-limit').FastifyRateLimitOptions,
    override = true,
  ): Route {
    if (!override) {
      this.rateLimitOptions = Options.create(this.rateLimitOptions, options)

      return this
    }

    this.rateLimitOptions = options

    return this
  }

  /**
   * Set a summary for the route swagger docs.
   */
  public summary(summary: string): Route {
    this.fastifySchema.summary = summary

    return this
  }

  /**
   * Set a description for the route swagger docs.
   */
  public description(description: string): Route {
    this.fastifySchema.description = description

    return this
  }

  /**
   * Set tags for the route swagger docs.
   *
   * @param {string} tags
   * @return {Route}
   */
  public tags(...tags: string[]): Route {
    if (!this.fastifySchema.tags) {
      this.fastifySchema.tags = []
    }

    tags.forEach(tag => this.fastifySchema.tags.push(tag))

    return this
  }

  /**
   * Set body param for the route swagger docs.
   */
  public body(name: string, type = 'string', description = ''): Route {
    if (!this.fastifySchema.body) {
      this.fastifySchema.body = {}
      this.fastifySchema.body.type = 'object'
      this.fastifySchema.body.properties = {}
    }

    this.fastifySchema.body.properties[name] = { type, description }

    return this
  }

  /**
   * Set param for the route swagger docs.
   */
  public param(name: string, type = 'string', description = ''): Route {
    if (!this.fastifySchema.params) {
      this.fastifySchema.params = {}
      this.fastifySchema.params.type = 'object'
      this.fastifySchema.params.properties = {}
    }

    this.fastifySchema.params.properties[name] = { type, description }

    return this
  }

  /**
   * Set query string for the route swagger docs.
   */
  public queryString(name: string, type = 'string', description = ''): Route {
    if (!this.fastifySchema.queryString) {
      this.fastifySchema.querystring = {}
      this.fastifySchema.querystring.type = 'object'
      this.fastifySchema.querystring.properties = {}
    }

    this.fastifySchema.querystring.properties[name] = { type, description }

    return this
  }

  /**
   * Set response for the route swagger docs.
   */
  public response(statusCode: number, response: any): Route {
    if (!this.fastifySchema.response) {
      this.fastifySchema.response = {}
    }

    this.fastifySchema.response[statusCode] = response

    return this
  }

  /**
   * Get the route as JSON.
   */
  public toJSON(): any {
    const json: any = {
      url: this.getUrl(),
      methods: this.methods,
      middlewares: this.routeMiddlewares,
      helmetOptions: this.helmetOptions,
      fastifySchema: this.fastifySchema,
      rateLimitOptions: this.rateLimitOptions,
    }

    if (Is.String(this.handler)) {
      const [controller, method] = this.handler.split('.')

      const dependency = ioc.safeUse(`App/Http/Controllers/${controller}`)

      if (!dependency[method]) {
        throw new UndefinedMethodException(method, controller)
      }

      json.handler = dependency[method].bind(dependency)
    } else {
      json.handler = this.handler
    }

    return json
  }

  /**
   * Get the route url parsed with prefixes.
   */
  private getUrl(): string {
    const url = this.removeSlashes(this.url) as string

    const prefix = this.prefixes
      .reverse()
      .map(p => this.removeSlashes(p))
      .join('')

    return prefix ? `${prefix}${url === '/' ? '' : url}` : url
  }

  /**
   * Remove slashes from the url.
   */
  private removeSlashes(url: string | string[]): string | string[] {
    if (url === '/') {
      return url
    }

    const matcher = url => `/${url.replace(/^\//, '').replace(/\/$/, '')}`

    if (Is.Array(url)) {
      return url.map(u => matcher(u))
    }

    return matcher(url)
  }
}
