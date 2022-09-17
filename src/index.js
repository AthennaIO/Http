/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Options } from '@secjs/utils'

import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import fastifyRateLimit from 'fastify-rate-limit'
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
   * Creates a new instance of Http class.
   *
   * @return {Http}
   */
  constructor() {
    this.#server = fastify()
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
   * @param {import('fastify').FastifyPluginCallback<import('fastify').FastifyPluginOptions>} plugin
   * @param {import('fastify').FastifyRegisterOptions<import('fastify').FastifyPluginOptions>} [options]
   * @return {Http}
   */
  register(plugin, options) {
    this.#server.register(plugin, options)

    return this
  }

  /**
   * Register the cors plugin to fastify server.
   *
   * @param {import('fastify-cors').FastifyCorsOptions} [options]
   * @return {Http}
   */
  registerCors(options) {
    this.register(fastifyCors, options)

    return this
  }

  /**
   * Register the rate limit plugin to fastify server.
   *
   * @param {import('fastify-rate-limit').RateLimitPluginOptions} [options]
   * @return {Http}
   */
  registerRateLimit(options) {
    this.register(fastifyRateLimit, options)

    return this
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
  async listen(port = 1335, host = '0.0.0.0') {
    return this.#server.listen(port, host)
  }

  /**
   * Close the http server.
   *
   * @return {Promise<void>}
   */
  async close() {
    return this.#server.close()
  }

  /**
   * Add a new route to the http server.
   *
   * @param {string} url
   * @param {string[]} methods
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  route(url, methods, handler, middlewares) {
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
    })
  }

  /**
   * Add a new GET route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  get(url, handler, middlewares) {
    this.route(url, ['GET'], handler, middlewares)
  }

  /**
   * Add a new HEAD route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  head(url, handler, middlewares) {
    this.route(url, ['HEAD'], handler, middlewares)
  }

  /**
   * Add a new POST route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  post(url, handler, middlewares) {
    this.route(url, ['POST'], handler, middlewares)
  }

  /**
   * Add a new PUT route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  put(url, handler, middlewares) {
    this.route(url, ['PUT'], handler, middlewares)
  }

  /**
   * Add a new PATCH route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  patch(url, handler, middlewares) {
    this.route(url, ['PATCH'], handler, middlewares)
  }

  /**
   * Add a new DELETE route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  delete(url, handler, middlewares) {
    this.route(url, ['DELETE'], handler, middlewares)
  }

  /**
   * Add a new OPTIONS route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  options(url, handler, middlewares) {
    this.route(url, ['OPTIONS'], handler, middlewares)
  }
}
