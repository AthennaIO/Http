/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Options } from '@athenna/common'

import fastify from 'fastify'

import { FastifyHandler } from '#src/Handlers/FastifyHandler'

export * from './Facades/Route.js'
export * from './Facades/Server.js'
export * from './Kernels/HttpKernel.js'
export * from './Handlers/HttpExceptionHandler.js'

export * from './Commands/Route/List.js'
export * from './Commands/Make/Controller.js'
export * from './Commands/Make/Middleware.js'

export * from './Helpers/HttpLoader.js'

export * from './Exceptions/BadGatewayException.js'
export * from './Exceptions/BadRequestException.js'
export * from './Exceptions/ForbiddenException.js'
export * from './Exceptions/HttpException.js'
export * from './Exceptions/InternalServerException.js'
export * from './Exceptions/MethodNotAllowedException.js'
export * from './Exceptions/NotAcceptableException.js'
export * from './Exceptions/NotFoundException.js'
export * from './Exceptions/NotImplementedException.js'
export * from './Exceptions/PayloadTooLargeException.js'
export * from './Exceptions/RequestTimeoutException.js'
export * from './Exceptions/ServiceUnavailableException.js'
export * from './Exceptions/UnauthorizedException.js'
export * from './Exceptions/UnprocessableEntityException.js'

export class Http {
  /**
   * Holds the fastify server instance.
   *
   * @type {import('fastify').FastifyInstance}
   */
  #server

  /**
   * Indicates if the http server is running or not.
   *
   * @type {boolean}
   */
  #isListening

  /**
   * Creates a new instance of Http class.
   *
   * @return {Http}
   */
  constructor() {
    this.#server = fastify()
    this.#isListening = false
  }

  /**
   * Set the fastify error handler.
   *
   * @param {any} handler
   * @return {Http}
   */
  setErrorHandler(handler) {
    const fastifyErrorHandler = FastifyHandler.createErrorHandler(handler)

    this.#server.setErrorHandler(fastifyErrorHandler)

    return this
  }

  /**
   * Register a new fastify plugin.
   *
   * @param {any} plugin
   * @param {any} [options]
   * @return {Http}
   */
  async register(plugin, options = {}) {
    await this.#server.register(plugin, options)

    return this
  }

  /**
   * Register the cors plugin to fastify server.
   *
   * @param {import('@fastify/cors').FastifyCorsOptions} [options]
   * @return {Http}
   */
  async registerCors(options) {
    return this.register(import('@fastify/cors'), options)
  }

  /**
   * Register the helmet plugin to fastify server.
   *
   * @param {import('@fastify/helmet').FastifyHelmetOptions} [options]
   * @return {Http}
   */
  async registerHelmet(options) {
    return this.register(import('@fastify/helmet'), options)
  }

  /**
   * Register the swagger plugin to fastify server.
   *
   * @param {{
   *    ui: import('@fastify/swagger-ui').FastifySwaggerUiOptions,
   *    configurations: import('@fastify/swagger').SwaggerOptions
   *  }} [options]
   * @return {Http}
   */
  async registerSwagger(options = {}) {
    await this.register(import('@fastify/swagger'), options.configurations)

    return this.register(import('@fastify/swagger-ui'), options.ui)
  }

  /**
   * Register the rate limit plugin to fastify server.
   *
   * @param {import('@fastify/rate-limit').RateLimitOptions} [options]
   * @return {Http}
   */
  async registerRateLimit(options) {
    return this.register(import('@fastify/rate-limit'), options)
  }

  /**
   * Get the fastify server instance.
   *
   * @return {import('fastify').FastifyInstance}
   */
  getFastify() {
    return this.#server
  }

  /**
   * Print all routes registered.
   *
   * @param {import('fastify').PrintRoutesOptions} [options]
   * @return {string}
   */
  getRoutes(options) {
    return this.#server.printRoutes(options)
  }

  /**
   * Get the server port where http is being running.
   *
   * @return {number}
   */
  getPort() {
    return this.#server.server.address().port
  }

  /**
   * Print all routes registered.
   *
   * @param {any} handler
   * @param {'handle'|'intercept'|'terminate'} type
   * @return void
   */
  use(handler, type = 'handle') {
    let hookName = 'preHandler'
    let handlerType = 'createDoneHandler'

    switch (type) {
      case 'intercept':
        hookName = 'onSend'
        handlerType = 'createOnSendHandler'
        break
      case 'terminate':
        hookName = 'onResponse'
        handlerType = 'createOnResponseHandler'
        break
    }

    this.#server.addHook(hookName, FastifyHandler[handlerType](handler))
  }

  /**
   * Return a request handler to make internal requests to the Http server.
   *
   * @param {import('fastify').InjectOptions|string} [options]
   * @return {import('light-my-request').Chain,Promise<import('light-my-request').Response>}
   */
  request(options) {
    const server = this.getFastify()

    if (!options) {
      return server.inject()
    }

    return server.inject(options)
  }

  /**
   * Boot the http server to start listening on port and host defined.
   *
   * @param {string|number} [port]
   * @param {string} [host]
   * @return {Promise<string>}
   */
  async listen(port = 0, host = '0.0.0.0') {
    this.#isListening = true

    return this.#server.listen({ port, host })
  }

  /**
   * Close the http server.
   *
   * @return {Promise<void>}
   */
  async close() {
    if (!this.#isListening) {
      return
    }

    return this.#server.close()
  }

  /**
   * Add a new route to the http server.
   *
   * @param {string} url
   * @param {string[]} methods
   * @param {any} handler
   * @param {any} [middlewares]
   * @param {import('fastify').RouteOptions} [otherOptions]
   * @return {void}
   */
  route(url, methods, handler, middlewares, otherOptions = {}) {
    const { handlers, terminators, interceptors } = Options.create(
      middlewares,
      {
        handlers: [],
        terminators: [],
        interceptors: [],
      },
    )

    this.#server.route({
      url,
      method: methods,
      onResponse: terminators.map(m =>
        FastifyHandler.createOnResponseHandler(m),
      ),
      handler: FastifyHandler.createRequestHandler(handler),
      preHandler: handlers.map(m => FastifyHandler.createDoneHandler(m)),
      onSend: interceptors.map(m => FastifyHandler.createOnSendHandler(m)),
      ...otherOptions,
    })
  }

  /**
   * Add a new GET route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @param {import('fastify').RouteOptions} [otherOptions]
   * @return {void}
   */
  get(url, handler, middlewares, otherOptions) {
    this.route(url, ['GET'], handler, middlewares, otherOptions)
  }

  /**
   * Add a new HEAD route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @param {import('fastify').RouteOptions} [otherOptions]
   * @return {void}
   */
  head(url, handler, middlewares, otherOptions) {
    this.route(url, ['HEAD'], handler, middlewares, otherOptions)
  }

  /**
   * Add a new POST route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @param {import('fastify').RouteOptions} [otherOptions]
   * @return {void}
   */
  post(url, handler, middlewares, otherOptions) {
    this.route(url, ['POST'], handler, middlewares, otherOptions)
  }

  /**
   * Add a new PUT route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @param {import('fastify').RouteOptions} [otherOptions]
   * @return {void}
   */
  put(url, handler, middlewares, otherOptions) {
    this.route(url, ['PUT'], handler, middlewares, otherOptions)
  }

  /**
   * Add a new PATCH route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @param {import('fastify').RouteOptions} [otherOptions]
   * @return {void}
   */
  patch(url, handler, middlewares, otherOptions) {
    this.route(url, ['PATCH'], handler, middlewares, otherOptions)
  }

  /**
   * Add a new DELETE route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @param {import('fastify').RouteOptions} [otherOptions]
   * @return {void}
   */
  delete(url, handler, middlewares, otherOptions) {
    this.route(url, ['DELETE'], handler, middlewares, otherOptions)
  }

  /**
   * Add a new OPTIONS route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @param {import('fastify').RouteOptions} [otherOptions]
   * @return {void}
   */
  options(url, handler, middlewares, otherOptions) {
    this.route(url, ['OPTIONS'], handler, middlewares, otherOptions)
  }
}
