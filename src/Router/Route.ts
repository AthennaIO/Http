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

import { RouteJSON } from '#src/Types/Router/RouteJSON'
import { Is, Route as RouteHelper } from '@athenna/common'
import { RouteContract } from '#src/Contracts/RouteContract'
import { RequestHandler } from '#src/Types/Contexts/Context'
import { RouteHandler } from '#src/Types/Router/RouteHandler'
import { HTTPMethods, FastifySchema, RouteOptions } from 'fastify'
import { MiddlewareTypes } from '#src/Types/Middlewares/MiddlewareTypes'
import { UndefinedMethodException } from '#src/Exceptions/UndefinedMethodException'

export class Route implements RouteContract {
  public name: string

  private url: string

  public deleted = false

  private handler: RequestHandler

  private methods: HTTPMethods[]

  private routeMiddlewares: MiddlewareRecord = {
    handlers: [],
    terminators: [],
    interceptors: [],
  }

  private prefixes: string[] = []

  private fastifyOptions: Partial<RouteOptions> = {}

  private helmetOptions: Omit<
    import('@fastify/helmet').FastifyHelmetOptions,
    'global'
  > = {}

  private fastifySchema: FastifySchema = {}

  private rateLimitOptions: import('@fastify/rate-limit').RateLimitOptions = {}

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

  public vanillaOptions(options: RouteOptions): RouteContract {
    this.fastifyOptions = options

    return this
  }

  public prefix(prefix: string): RouteContract {
    this.prefixes.push(prefix)

    return this
  }

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

  public helmet(
    options: Omit<import('@fastify/helmet').FastifyHelmetOptions, 'global'>,
  ): RouteContract {
    this.helmetOptions = options

    return this
  }

  public schema(options: FastifySchema): RouteContract {
    this.fastifySchema = options

    return this
  }

  public rateLimit(
    options: import('@fastify/rate-limit').RateLimitOptions,
  ): RouteContract {
    this.rateLimitOptions = options

    return this
  }

  public hide(): RouteContract {
    this.fastifySchema.hide = true

    return this
  }

  public deprecated(): RouteContract {
    this.fastifySchema.deprecated = true

    return this
  }

  public summary(summary: string): RouteContract {
    this.fastifySchema.summary = summary

    return this
  }

  public description(description: string): RouteContract {
    this.fastifySchema.description = description

    return this
  }

  public tags(tags: string[]): RouteContract {
    if (!this.fastifySchema.tags) {
      this.fastifySchema.tags = []
    }

    tags.forEach(tag => this.fastifySchema.tags.push(tag))

    return this
  }

  public body(name: string, body: any = {}): RouteContract {
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

  public param(name: string, param: any = {}): RouteContract {
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

  public queryString(name: string, queryString: any = {}): RouteContract {
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

  public response(statusCode: number, response: any = {}): RouteContract {
    if (!this.fastifySchema.response) {
      this.fastifySchema.response = {}
    }

    this.fastifySchema.response[statusCode] = response

    return this
  }

  public security(key: string, values: string[]): RouteContract {
    if (!this.fastifySchema.security) {
      this.fastifySchema.security = []
    }

    this.fastifySchema.security.push({ [key]: values })

    return this
  }

  public externalDocs(url: string, description?: string): RouteContract {
    this.fastifySchema.externalDocs = {
      url,
      description,
    }

    return this
  }

  public consumes(consumes: string[]): RouteContract {
    this.fastifySchema.consumes = consumes

    return this
  }

  public produces(produces: string[]): RouteContract {
    this.fastifySchema.produces = produces

    return this
  }

  public toJSON(): RouteJSON {
    return {
      url: this.getUrl(),
      methods: this.methods,
      handler: this.handler,
      middlewares: this.routeMiddlewares,
      fastifyOptions: {
        helmet: this.helmetOptions,
        schema: this.fastifySchema,
        rateLimitOptions: this.rateLimitOptions,
        config: { rateLimit: this.rateLimitOptions },
        ...this.fastifyOptions,
      },
    }
  }

  private getUrl(): string {
    const url = this.removeSlashes(this.url) as string

    const prefix = this.prefixes
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
