/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RouteJSON } from '#src/Types/Router/RouteJSON'
import { Is, Route as RouteHelper } from '@athenna/common'
import { RequestHandler } from '#src/Types/Contexts/Context'
import { RouteHandler } from '#src/Types/Router/RouteHandler'
import { HTTPMethods, FastifySchema, RouteOptions } from 'fastify'
import { MiddlewareRecord } from '#src/Types/Middlewares/MiddlewareHandler'
import { MiddlewareRouteType } from '#src/Types/Middlewares/MiddlewareRouteType'
import { TerminatorRouteType } from '#src/Types/Middlewares/TerminatorRouteType'
import { InterceptorRouteType } from '#src/Types/Middlewares/InterceptorRouteType'
import { UndefinedMethodException } from '#src/Exceptions/UndefinedMethodException'

export class Route {
  /**
   * Holds all the route implementations to be registered in the Server.
   */
  public route: {
    url?: string
    methods: HTTPMethods[]
    handler?: RequestHandler
    name?: string
    deleted?: boolean
    prefixes?: string[]
    middlewares?: MiddlewareRecord
    fastify?: Partial<RouteOptions>
  }

  public constructor(
    url: string,
    methods: HTTPMethods[],
    handler: RouteHandler,
  ) {
    this.route = {
      url,
      methods,
      deleted: false,
      prefixes: [],
      middlewares: {
        middlewares: [],
        terminators: [],
        interceptors: [],
      },
      fastify: {},
    }

    if (Is.String(handler)) {
      const [controller, method] = handler.split('.')

      const dependency = ioc.safeUse(`App/Http/Controllers/${controller}`)

      if (!dependency[method]) {
        throw new UndefinedMethodException(method, controller)
      }

      this.route.handler = dependency[method].bind(dependency)
    } else {
      this.route.handler = handler
    }

    RouteHelper.getParamsName(url).forEach(param => this.param(param))
  }

  /**
   * Set the route name.
   *
   * @example
   * ```ts
   * Route.name('profile')
   * ```
   */
  public name(name: string): Route {
    this.route.name = name

    return this
  }

  /**
   * Set fastify vanilla route options.
   *
   * @example
   * ```ts
   * Route.vanillaOptions({ schema: {} })
   * ```
   */
  public vanillaOptions(options: RouteOptions): Route {
    this.route.fastify = {
      ...this.route.fastify,
      ...options,
    }

    return this
  }

  /**
   * Set a prefix for the route.
   *
   * @example
   * ```ts
   * Route.prefix('/api/v1')
   * ```
   */
  public prefix(prefix: string): Route {
    this.route.prefixes.push(prefix)

    return this
  }

  /**
   * Set a named middleware, middleware closure or a MiddlewareContract implementation
   * in the route.
   */
  public middleware(middleware: MiddlewareRouteType, prepend = false): Route {
    const insertionType = prepend ? 'unshift' : 'push'

    if (Is.String(middleware)) {
      const mid =
        ioc.use(`App/Http/Middlewares/Names/${middleware}`) ||
        ioc.safeUse(`App/Http/Middlewares/${middleware}`)

      this.route.middlewares.middlewares[insertionType](mid.handle.bind(mid))

      return this
    }

    if (Is.Function(middleware)) {
      this.route.middlewares.middlewares[insertionType](middleware)

      return this
    }

    this.route.middlewares.middlewares[insertionType](
      middleware.handle.bind(middleware),
    )

    return this
  }

  /**
   * Set a named interceptor, interceptor closure or a InterceptorContract implementation
   * in the route.
   */
  public interceptor(
    interceptor: InterceptorRouteType,
    prepend = false,
  ): Route {
    const insertionType = prepend ? 'unshift' : 'push'

    if (Is.String(interceptor)) {
      const inte =
        ioc.use(`App/Http/Middlewares/Names/${interceptor}`) ||
        ioc.safeUse(`App/Http/Middlewares/${interceptor}`)

      this.route.middlewares.interceptors[insertionType](
        inte.intercept.bind(inte),
      )

      return this
    }

    if (Is.Function(interceptor)) {
      this.route.middlewares.interceptors[insertionType](interceptor)

      return this
    }

    this.route.middlewares.interceptors[insertionType](
      interceptor.intercept.bind(interceptor),
    )

    return this
  }

  /**
   * Set a named terminator, terminator closure or a TerminatorContract implementation
   * in the route.
   */
  public terminator(terminator: TerminatorRouteType, prepend = false): Route {
    const insertionType = prepend ? 'unshift' : 'push'

    if (Is.String(terminator)) {
      const ter =
        ioc.use(`App/Http/Middlewares/Names/${terminator}`) ||
        ioc.safeUse(`App/Http/Middlewares/${terminator}`)

      this.route.middlewares.terminators[insertionType](ter.terminate.bind(ter))

      return this
    }

    if (Is.Function(terminator)) {
      this.route.middlewares.terminators[insertionType](terminator)

      return this
    }

    this.route.middlewares.terminators[insertionType](
      terminator.terminate.bind(terminator),
    )

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
  ): Route {
    this.route.fastify.helmet = options

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
  public schema(options: FastifySchema): Route {
    this.route.fastify.schema = options

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
  ): Route {
    if (!this.route.fastify.config) {
      this.route.fastify.config = {}
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.route.fastify.config.rateLimit = options

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
  public hide(): Route {
    if (!this.route.fastify.schema) {
      this.route.fastify.schema = {}
    }

    this.route.fastify.schema.hide = true

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
  public deprecated(): Route {
    if (!this.route.fastify.schema) {
      this.route.fastify.schema = {}
    }

    this.route.fastify.schema.deprecated = true

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
  public summary(summary: string): Route {
    if (!this.route.fastify.schema) {
      this.route.fastify.schema = {}
    }

    this.route.fastify.schema.summary = summary

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
  public description(description: string): Route {
    if (!this.route.fastify.schema) {
      this.route.fastify.schema = {}
    }

    this.route.fastify.schema.description = description

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
  public tags(tags: string[]): Route {
    if (!this.route.fastify.schema) {
      this.route.fastify.schema = {}
    }

    if (!this.route.fastify.schema.tags) {
      this.route.fastify.schema.tags = []
    }

    tags.forEach(tag => this.route.fastify.schema.tags.push(tag))

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
  public body(name: string, body: any = {}): Route {
    if (!this.route.fastify.schema) {
      this.route.fastify.schema = {}
    }

    if (!this.route.fastify.schema.body) {
      this.route.fastify.schema.body = {
        type: 'object',
        properties: {},
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.route.fastify.schema.body.properties[name] = body

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
  public param(name: string, param: any = {}): Route {
    if (!this.route.fastify.schema) {
      this.route.fastify.schema = {}
    }

    if (!this.route.fastify.schema.params) {
      this.route.fastify.schema.params = {
        type: 'object',
        properties: {},
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.route.fastify.schema.params.properties[name] = param

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
  public queryString(name: string, queryString: any = {}): Route {
    if (!this.route.fastify.schema) {
      this.route.fastify.schema = {}
    }

    if (!this.route.fastify.schema.querystring) {
      this.route.fastify.schema.querystring = {
        type: 'object',
        properties: {},
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.route.fastify.schema.querystring.properties[name] = queryString

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
  public response(statusCode: number, response: any = {}): Route {
    if (!this.route.fastify.schema) {
      this.route.fastify.schema = {}
    }

    if (!this.route.fastify.schema.response) {
      this.route.fastify.schema.response = {}
    }

    this.route.fastify.schema.response[statusCode] = response

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
  public security(key: string, values: string[]): Route {
    if (!this.route.fastify.schema) {
      this.route.fastify.schema = {}
    }

    if (!this.route.fastify.schema.security) {
      this.route.fastify.schema.security = []
    }

    this.route.fastify.schema.security.push({ [key]: values })

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
  public externalDocs(url: string, description?: string): Route {
    if (!this.route.fastify.schema) {
      this.route.fastify.schema = {}
    }

    if (!this.route.fastify.schema.externalDocs) {
      this.route.fastify.schema.externalDocs = {
        url: '',
        description: '',
      }
    }

    this.route.fastify.schema.externalDocs.url = url
    this.route.fastify.schema.externalDocs.description = description

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
  public consumes(consumes: string[]): Route {
    if (!this.route.fastify.schema) {
      this.route.fastify.schema = {}
    }

    this.route.fastify.schema.consumes = consumes

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
  public produces(produces: string[]): Route {
    if (!this.route.fastify.schema) {
      this.route.fastify.schema = {}
    }

    this.route.fastify.schema.produces = produces

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
      methods: this.route.methods,
      name: this.route.name,
      deleted: this.route.deleted,
      prefixes: this.route.prefixes,
      handler: this.route.handler,
      middlewares: this.route.middlewares,
      fastify: this.route.fastify,
    }
  }

  private getUrl(): string {
    const url = this.removeSlashes(this.route.url) as string

    const prefix = this.route.prefixes
      .reverse()
      .map(p => this.removeSlashes(p))
      .join('')

    return prefix ? `${prefix}${url === '/' ? '' : url}` : url
  }

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
