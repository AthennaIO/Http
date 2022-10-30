/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is, Options, Route as RouteHelper } from '@athenna/common'
import { removeSlashes } from '#src/Utils/removeSlashes'
import { isMiddlewareContract } from '#src/Utils/isMiddlewareContract'
import { UndefinedMethodException } from '#src/Exceptions/UndefinedMethodException'

export class Route {
  /**
   * Route name for resources.
   *
   * @type {string}
   */
  name

  /**
   * Route url.
   *
   * @type {string}
   */
  #url

  /**
   * Sets if route should be registered or not.
   *
   * @type {boolean}
   */
  #deleted

  /**
   * The route handler closure.
   *
   * @type {string|any}
   */
  #handler

  /**
   * The methods of this route.
   *
   * @type {string[]}
   */
  #methods

  /**
   * The middlewares of this route.
   *
   * @type {{ handlers: any[], terminators: any[], interceptors: any[] }}
   */
  #routeMiddlewares

  /**
   * The prefixes of this route.
   *
   * @type {string[]}
   */
  #prefixes

  /**
   * Helmet options of this route.
   *
   * @type {any}
   */
  #helmetOptions

  /**
   * Swagger options of this route.
   *
   * @type {any}
   */
  #swaggerOptions

  /**
   * Rate limit options of this route.
   *
   * @type {any}
   */
  #rateLimitOptions

  /**
   * Creates a new instance of Route.
   *
   * @param {string} url
   * @param {string[]} methods
   * @param {string|any} handler
   * @param {string} [name]
   * @return {Route}
   */
  constructor(url, methods, handler, name) {
    this.#url = url
    this.#deleted = false
    this.#methods = methods
    this.#prefixes = []
    this.#handler = handler
    this.#routeMiddlewares = { handlers: [], terminators: [], interceptors: [] }

    this.#helmetOptions = {}
    this.#swaggerOptions = {}
    this.#rateLimitOptions = {}

    RouteHelper.getParamsName(url).forEach(param => this.param(param))

    if (name) {
      this.name = name
    }
  }

  /**
   * Set a prefix for the route.
   *
   * @param {string} prefix
   * @return {Route}
   */
  prefix(prefix) {
    this.#prefixes.push(prefix)

    return this
  }

  /**
   * Set a middleware for the route.
   *
   * @param {string|any} middleware
   * @param {'handle'|'intercept'|'terminate'} [type]
   * @param {boolean} [prepend]
   * @return {Route}
   */
  middleware(middleware, type = 'handle', prepend = false) {
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
        this.#routeMiddlewares.handlers[insertionType](mid.handle.bind(mid))
      }

      if (mid.intercept) {
        this.#routeMiddlewares.interceptors[insertionType](
          mid.intercept.bind(mid),
        )
      }

      if (mid.terminate) {
        this.#routeMiddlewares.terminators[insertionType](
          mid.terminate.bind(mid),
        )
      }

      return this
    }

    if (isMiddlewareContract(middleware)) {
      if (middleware.handle) {
        this.#routeMiddlewares.handlers[insertionType](
          middleware.handle.bind(middleware),
        )
      }

      if (middleware.intercept) {
        this.#routeMiddlewares.interceptors[insertionType](
          middleware.intercept.bind(middleware),
        )
      }

      if (middleware.terminate) {
        this.#routeMiddlewares.terminators[insertionType](
          middleware.terminate.bind(middleware),
        )
      }

      return this
    }

    this.#routeMiddlewares[dictionary[type]][insertionType](middleware)

    return this
  }

  /**
   * Set up all helmet options for route.
   *
   * @param {any} options
   * @param {boolean} [override]
   * @return {Route}
   */
  helmet(options, override = true) {
    if (!override) {
      this.#helmetOptions = Options.create(this.#helmetOptions, options)

      return this
    }

    this.#helmetOptions = options

    return this
  }

  /**
   * Set up all swagger options for route.
   *
   * @param {any} options
   * @param {boolean} [override]
   * @return {Route}
   */
  swagger(options, override = true) {
    if (!override) {
      this.#swaggerOptions = Options.create(this.#swaggerOptions, options)

      return this
    }

    this.#swaggerOptions = options

    return this
  }

  /**
   * Set up all rate limit options for route.
   *
   * @param {any} options
   * @param {boolean} [override]
   * @return {Route}
   */
  rateLimit(options, override = true) {
    if (!override) {
      this.#rateLimitOptions = Options.create(this.#rateLimitOptions, options)

      return this
    }

    this.#rateLimitOptions = options

    return this
  }

  /**
   * Set a summary for the route swagger docs.
   *
   * @param {string} summary
   * @return {Route}
   */
  summary(summary) {
    this.#swaggerOptions.summary = summary

    return this
  }

  /**
   * Set a description for the route swagger docs.
   *
   * @param {string} description
   * @return {Route}
   */
  description(description) {
    this.#swaggerOptions.description = description

    return this
  }

  /**
   * Set tags for the route swagger docs.
   *
   * @param {string} tags
   * @return {Route}
   */
  tags(...tags) {
    if (!this.#swaggerOptions.tags) {
      this.#swaggerOptions.tags = []
    }

    tags.forEach(tag => this.#swaggerOptions.tags.push(tag))

    return this
  }

  /**
   * Set body param for the route swagger docs.
   *
   * @param {string} name
   * @param {string} [type]
   * @param {string} [description]
   * @return {Route}
   */
  body(name, type = 'string', description = '') {
    if (!this.#swaggerOptions.body) {
      this.#swaggerOptions.body = {}
      this.#swaggerOptions.body.type = 'object'
      this.#swaggerOptions.body.properties = {}
    }

    this.#swaggerOptions.body.properties[name] = { type, description }

    return this
  }

  /**
   * Set param for the route swagger docs.
   *
   * @param {string} name
   * @param {string} [type]
   * @param {string} [description]
   * @return {Route}
   */
  param(name, type = 'string', description = '') {
    if (!this.#swaggerOptions.params) {
      this.#swaggerOptions.params = {}
      this.#swaggerOptions.params.type = 'object'
      this.#swaggerOptions.params.properties = {}
    }

    this.#swaggerOptions.params.properties[name] = { type, description }

    return this
  }

  /**
   * Set query string for the route swagger docs.
   *
   * @param {string} name
   * @param {string} [type]
   * @param {string} [description]
   * @return {Route}
   */
  queryString(name, type = 'string', description = '') {
    if (!this.#swaggerOptions.queryString) {
      this.#swaggerOptions.querystring = {}
      this.#swaggerOptions.querystring.type = 'object'
      this.#swaggerOptions.querystring.properties = {}
    }

    this.#swaggerOptions.querystring.properties[name] = { type, description }

    return this
  }

  /**
   * Set response for the route swagger docs.
   *
   * @param {number|any} statusCode
   * @param {any} [response]
   * @return {Route}
   */
  response(statusCode, response) {
    if (!this.#swaggerOptions.response) {
      this.#swaggerOptions.response = {}
    }

    if (!response) {
      this.#swaggerOptions.response.default = response

      return this
    }

    this.#swaggerOptions.response[statusCode] = response

    return this
  }

  toJSON() {
    const json = {
      url: this.#getUrl(),
      methods: this.#methods,
      middlewares: this.#routeMiddlewares,
      helmetOptions: this.#helmetOptions,
      swaggerOptions: this.#swaggerOptions,
      rateLimitOptions: this.#rateLimitOptions,
    }

    if (Is.String(this.#handler)) {
      const [controller, method] = this.#handler.split('.')

      const dependency = ioc.safeUse(`App/Http/Controllers/${controller}`)

      if (!dependency[method]) {
        throw new UndefinedMethodException(method, controller)
      }

      json.handler = dependency[method].bind(dependency)
    } else {
      json.handler = this.#handler
    }

    return json
  }

  /**
   * Get the route url parsed with prefixes.
   *
   * @return {string}
   */
  #getUrl() {
    const url = removeSlashes(this.#url)

    const prefix = this.#prefixes
      .slice()
      .reverse()
      .map(p => removeSlashes(p))
      .join('')

    return prefix ? `${prefix}${url === '/' ? '' : url}` : url
  }
}
