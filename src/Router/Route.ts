/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  MiddlewareRecord,
  MiddlewareHandlerExt,
} from '#src/Types/Middlewares/MiddlewareHandler'

import { HTTPMethods, FastifySchema } from 'fastify'
import { RouteJSON } from '#src/Types/Router/RouteJSON'
import { Is, Route as RouteHelper } from '@athenna/common'
import { RequestHandler } from '#src/Types/Contexts/Context'
import { RouteHandler } from '#src/Types/Router/RouteHandler'
import { RouteContract } from '#src/Types/Contracts/RouteContract'
import { MiddlewareTypes } from '#src/Types/Middlewares/MiddlewareTypes'
import { UndefinedMethodException } from '#src/Exceptions/UndefinedMethodException'

export class Route implements RouteContract {
  /**
   * A unique name to lookup the route
   */
  public name: string

  /**
   * Route url.
   */
  private url: string

  /**
   * Sets if route should be registered or not.
   */
  public deleted = false

  /**
   * The route handler closure.
   */
  private handler: RequestHandler

  /**
   * The methods of this route.
   */
  private methods: HTTPMethods[]

  /**
   * The middlewares of this route.
   */
  private routeMiddlewares: MiddlewareRecord = {
    handlers: [],
    terminators: [],
    interceptors: [],
  }

  /**
   * The prefixes of this route.
   */
  private prefixes: string[] = []

  /**
   * Helmet options of this route.
   */
  private helmetOptions: Omit<
    import('@fastify/helmet').FastifyHelmetOptions,
    'global'
  > = {}

  /**
   * Fastify schema options of this route.
   */
  private fastifySchema: FastifySchema = {}

  /**
   * Rate limit options of this route.
   */
  private rateLimitOptions: import('@fastify/rate-limit').FastifyRateLimitOptions =
    {}

  public constructor(
    url: string,
    methods: HTTPMethods[],
    handler: RouteHandler,
  ) {
    this.url = url
    this.methods = methods

    if (Is.String(handler)) {
      const [controller, method] = handler.split('.')

      const dependency = ioc.safeUse(`App/Http/Controllers/${controller}`)

      if (!dependency[method]) {
        throw new UndefinedMethodException(method, controller)
      }

      this.handler = dependency[method].bind(dependency)
    } else {
      this.handler = handler
    }

    RouteHelper.getParamsName(url).forEach(param => this.param(param))
  }

  /**
   * Set a prefix for the route.
   *
   * @example
   * ```ts
   * Route.prefix('/api/v1')
   * ```
   */
  public prefix(prefix: string): RouteContract {
    this.prefixes.push(prefix)

    return this
  }

  /**
   * Set a middleware class, named middleware string or middleware handlers in route.
   *
   * @example
   * ```ts
   * Route.middleware('my-middleware')
   * ```
   * Or
   * ```ts
   * Route.middleware(MyMiddleware)
   * ```
   * Or
   * ```ts
   * Route.middleware(ctx => {}, 'handle')
   * ```
   * Or
   * ```ts
   * Route.middleware(ctx => {
   *  return ctx.body
   * }, 'intercept')
   * ```
   * Or
   * ```ts
   * Route.middleware(ctx => {}, 'terminate')
   * ```
   */
  public middleware(
    middleware: MiddlewareHandlerExt,
    type: MiddlewareTypes = 'handle',
    prepend = false,
  ): RouteContract {
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
   *
   * @example
   * ```ts
   * Route.helmet({
   *  dnsPrefetchControl: { allow: true }
   * })
   * ```
   */
  public helmet(
    options: Omit<import('@fastify/helmet').FastifyHelmetOptions, 'global'>,
  ): RouteContract {
    this.helmetOptions = options

    return this
  }

  /**
   * Set up all schema options for route.
   *
   * @example
   * ```ts
   * Route.schema({
   *  body: {
   *    type: 'array',
   *    items: {
   *      oneOf: [{ type: 'string', description: 'User name' }]
   *    }
   *  }
   * })
   * ```
   */
  public schema(options: FastifySchema): RouteContract {
    this.fastifySchema = options

    return this
  }

  /**
   * Set up all rate limit options for route.
   *
   * @example
   * ```ts
   * Route.rateLimit({
   *  max: 3,
   *  timeWindow: '1 minute'
   * })
   * ```
   */
  public rateLimit(
    options: import('@fastify/rate-limit').RateLimitOptions,
  ): RouteContract {
    this.rateLimitOptions = options

    return this
  }

  /**
   * Hide the route in swagger docs.
   *
   * @example
   * ```ts
   * Route.hide()
   * ```
   */
  public hide(): RouteContract {
    this.fastifySchema.hide = true

    return this
  }

  /**
   * Set the route as deprecated in swagger docs.
   *
   * @example
   * ```ts
   * Route.deprecated()
   * ```
   */
  public deprecated(): RouteContract {
    this.fastifySchema.deprecated = true

    return this
  }

  /**
   * Set a summary for the route swagger docs.
   *
   * @example
   * ```ts
   * Route.summary('List all users')
   * ```
   */
  public summary(summary: string): RouteContract {
    this.fastifySchema.summary = summary

    return this
  }

  /**
   * Set a description for the route swagger docs.
   *
   * @example
   * ```ts
   * Route.description('List all users')
   * ```
   */
  public description(description: string): RouteContract {
    this.fastifySchema.description = description

    return this
  }

  /**
   * Set tags for the route swagger docs.
   *
   * @example
   * ```ts
   * Route.tags(['v1'])
   * ```
   */
  public tags(tags: string[]): RouteContract {
    if (!this.fastifySchema.tags) {
      this.fastifySchema.tags = []
    }

    tags.forEach(tag => this.fastifySchema.tags.push(tag))

    return this
  }

  /**
   * Set body param for the route swagger docs.
   *
   * @example
   * ```ts
   * Route.body('name', {
   *  type: 'string',
   *  description: 'User name'
   * })
   * ```
   */
  public body(name: string, body?: any): RouteContract {
    if (!this.fastifySchema.body) {
      this.fastifySchema.body = {
        type: 'object',
        properties: {},
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.fastifySchema.body.properties[name] = body

    return this
  }

  /**
   * Set param for the route swagger docs.
   *
   * @example
   * ```ts
   * Route.param('id', { description: 'Set the user id' })
   * ```
   */
  public param(name: string, param?: any): RouteContract {
    if (!this.fastifySchema.params) {
      this.fastifySchema.params = {
        type: 'object',
        properties: {},
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.fastifySchema.params.properties[name] = param

    return this
  }

  /**
   * Set query string for the route swagger docs.
   *
   * @example
   * ```ts
   * Route.queryString('page', { description: 'Set the pagination page' })
   * ```
   */
  public queryString(name: string, queryString?: any): RouteContract {
    if (!this.fastifySchema.querystring) {
      this.fastifySchema.querystring = {
        type: 'object',
        properties: {},
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.fastifySchema.querystring.properties[name] = queryString

    return this
  }

  /**
   * Set response for the route swagger docs.
   *
   * @example
   * For objects
   * ```ts
   * Route.response(200, {
   *  description: 'Return one user',
   *  properties: {
   *    name: { type: 'string', description: 'User name' }
   *  }
   * })
   * ```
   *
   * For arrays
   * ```ts
   * Route.response(200, {
   *  description: 'Return users paginated',
   *  schema: {
   *    type: 'array'
   *    oneOf: [
   *      { type: 'string', description: 'User name' }
   *    ]
   *  }
   * })
   * ```
   */
  public response(statusCode: number, response?: any): RouteContract {
    if (!this.fastifySchema.response) {
      this.fastifySchema.response = {}
    }

    this.fastifySchema.response[statusCode] = response

    return this
  }

  /**
   * Set the route security in swagger docs.
   *
   * @example
   * ```ts
   * Route.security('apiToken', [])
   * ```
   */
  public security(key: string, values: string[]): RouteContract {
    if (!this.fastifySchema.security) {
      this.fastifySchema.security = []
    }

    this.fastifySchema.security.push({ [key]: values })

    return this
  }

  /**
   * Set the external documentation url in swagger docs.
   *
   * @example
   * ```ts
   * Route.externalDocs('https://github.com/athennaio/docs', 'Athenna Framework Documentation')
   * ```
   */
  public externalDocs(url: string, description?: string): RouteContract {
    this.fastifySchema.externalDocs = {
      url,
      description,
    }

    return this
  }

  /**
   * Set the type of the content that the API consumes in swagger docs.
   *
   * @example
   * ```ts
   * Route.consumes(['json', 'yaml', ...])
   * ```
   */
  public consumes(consumes: string[]): RouteContract {
    this.fastifySchema.consumes = consumes

    return this
  }

  /**
   * Set the type of the content that the API produces in swagger docs.
   *
   * @example
   * ```ts
   * Route.produces(['json', 'yaml', ...])
   * ```
   */
  public produces(produces: string[]): RouteContract {
    this.fastifySchema.produces = produces

    return this
  }

  /**
   * Get the route as JSON.
   *
   * @example
   * ```ts
   * Route.toJSON()
   * ```
   */
  public toJSON(): RouteJSON {
    return {
      url: this.getUrl(),
      methods: this.methods,
      handler: this.handler,
      middlewares: this.routeMiddlewares,
      helmetOptions: this.helmetOptions,
      fastifySchema: this.fastifySchema,
      rateLimitOptions: this.rateLimitOptions,
    }
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
