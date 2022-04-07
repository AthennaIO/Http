/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import LightMyRequest from 'light-my-request'

import fastify, {
  FastifyInstance,
  InjectOptions,
  PrintRoutesOptions,
} from 'fastify'

import { FastifyHandler } from './Handlers/FastifyHandler'
import { HttpMethodTypes } from './Contracts/HttpMethodTypes'
import { HandlerContract } from './Contracts/Context/HandlerContract'
import { MiddlewareTypesContract } from './Contracts/MiddlewareTypesContract'
import { ErrorHandlerContract } from './Contracts/Context/Error/ErrorHandlerContract'
import { HandleHandlerContract } from './Contracts/Context/Middlewares/Handle/HandleHandlerContract'
import { InterceptHandlerContract } from './Contracts/Context/Middlewares/Intercept/InterceptHandlerContract'
import { TerminateHandlerContract } from './Contracts/Context/Middlewares/Terminate/TerminateHandlerContract'

export class Http {
  /**
   * Holds the fastify server instance.
   *
   * @private
   */
  private readonly server: FastifyInstance

  /**
   * Instantiate Http class and fastify server.
   *
   * @return Http
   */
  constructor() {
    this.server = fastify()
  }

  /**
   * Set the fastify error handler.
   *
   * @return Http
   */
  setErrorHandler(handler: ErrorHandlerContract) {
    const fastifyErrorHandler = FastifyHandler.createErrorHandler(handler)

    this.server.setErrorHandler(fastifyErrorHandler)
  }

  /**
   * Get the fastify server instance.
   *
   * @return FastifyInstance
   */
  getServer(): FastifyInstance {
    return this.server
  }

  /**
   * Print all routes registered
   *
   * @param options {PrintRoutesOptions}
   * @return string
   */
  getRoutes(options?: PrintRoutesOptions): string {
    return this.server.printRoutes(options)
  }

  /**
   * Print all routes registered.
   *
   * @param handler {HandleHandlerContract,InterceptHandlerContract,TerminateHandlerContract}
   * @param type {handle,intercept,terminate}
   * @return void
   */
  use(
    handler:
      | HandleHandlerContract
      | InterceptHandlerContract
      | TerminateHandlerContract,
    type: 'handle' | 'intercept' | 'terminate' = 'handle',
  ) {
    let hookName: any = 'preHandler'
    let handlerType = 'createDoneHandler'

    switch (type) {
      case 'intercept':
        hookName = 'onSend'
        handlerType = 'createOnSendHandler'
        break
      case 'terminate':
        hookName = 'onResponse'
        handlerType = 'createResponseHandler'
        break
    }

    this.server.addHook(hookName, FastifyHandler[handlerType](handler))
  }

  request(): LightMyRequest.Chain
  request(options: InjectOptions | string): Promise<LightMyRequest.Response>

  /**
   * Return a request handler to make internal requests to the Http server.
   *
   * @param options {InjectOptions,string}
   * @return {LightMyRequest.Chain,Promise<LightMyRequest.Response>}
   */
  request(
    options?: InjectOptions | string,
  ): LightMyRequest.Chain | Promise<LightMyRequest.Response> {
    const server = this.getServer()

    if (!options) {
      return server.inject()
    }

    return server.inject(options)
  }

  /**
   * Boot the http server to start listening on port and host defined.
   *
   * @param port {string,number}
   * @param host {string}
   * @return void
   */
  async listen(port?: string | number, host?: string): Promise<string> {
    return this.server.listen(port || 1335, host || 'localhost')
  }

  /**
   * Close the http server.
   *
   * @param cb {any}
   * @return Promise<void>
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async close(cb?: any): Promise<void> {
    if (cb) {
      return this.server.close(cb)
    }

    return this.server.close()
  }

  /**
   * Add a new route to the http server.
   *
   * @param url {string}
   * @param methods {HttpMethodTypes[]}
   * @param handler {HandlerContract}
   * @param middlewares {MiddlewareTypesContract}
   * @return void
   */
  route(
    url: string,
    methods: HttpMethodTypes[],
    handler: HandlerContract,
    middlewares?: MiddlewareTypesContract,
  ) {
    const { handlers, terminators, interceptors } = Object.assign(
      {},
      { handlers: [], terminators: [], interceptors: [] },
      middlewares,
    )

    this.server.route({
      url,
      method: methods,
      handler: FastifyHandler.createRequestHandler(handler),
      preHandler: handlers.map(m => FastifyHandler.createDoneHandler(m)),
      onResponse: terminators.map(m => FastifyHandler.createResponseHandler(m)),
      onSend: interceptors.map(m => FastifyHandler.createOnSendHandler(m)),
    })
  }

  /**
   * Add a new GET route to the http server.
   *
   * @param url {string}
   * @param handler {HandlerContract}
   * @param middlewares {MiddlewareTypesContract}
   * @return void
   */
  get(
    url: string,
    handler: HandlerContract,
    middlewares?: MiddlewareTypesContract,
  ) {
    this.route(url, ['GET'], handler, middlewares)
  }

  /**
   * Add a new HEAD route to the http server.
   *
   * @param url {string}
   * @param handler {HandlerContract}
   * @param middlewares {MiddlewareTypesContract}
   * @return void
   */
  head(
    url: string,
    handler: HandlerContract,
    middlewares?: MiddlewareTypesContract,
  ) {
    this.route(url, ['HEAD'], handler, middlewares)
  }

  /**
   * Add a new POST route to the http server.
   *
   * @param url {string}
   * @param handler {HandlerContract}
   * @param middlewares {MiddlewareTypesContract}
   * @return void
   */
  post(
    url: string,
    handler: HandlerContract,
    middlewares?: MiddlewareTypesContract,
  ) {
    this.route(url, ['POST'], handler, middlewares)
  }

  /**
   * Add a new PUT route to the http server.
   *
   * @param url {string}
   * @param handler {HandlerContract}
   * @param middlewares {MiddlewareTypesContract}
   * @return void
   */
  put(
    url: string,
    handler: HandlerContract,
    middlewares?: MiddlewareTypesContract,
  ) {
    this.route(url, ['PUT'], handler, middlewares)
  }

  /**
   * Add a new PATCH route to the http server.
   *
   * @param url {string}
   * @param handler {HandlerContract}
   * @param middlewares {MiddlewareTypesContract}
   * @return void
   */
  patch(
    url: string,
    handler: HandlerContract,
    middlewares?: MiddlewareTypesContract,
  ) {
    this.route(url, ['PATCH'], handler, middlewares)
  }

  /**
   * Add a new DELETE route to the http server.
   *
   * @param url {string}
   * @param handler {HandlerContract}
   * @param middlewares {MiddlewareTypesContract}
   * @return void
   */
  delete(
    url: string,
    handler: HandlerContract,
    middlewares?: MiddlewareTypesContract,
  ) {
    this.route(url, ['DELETE'], handler, middlewares)
  }

  /**
   * Add a new OPTIONS route to the http server.
   *
   * @param url {string}
   * @param handler {HandlerContract}
   * @param middlewares {MiddlewareTypesContract}
   * @return void
   */
  options(
    url: string,
    handler: HandlerContract,
    middlewares?: MiddlewareTypesContract,
  ) {
    this.route(url, ['OPTIONS'], handler, middlewares)
  }
}
