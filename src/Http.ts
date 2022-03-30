/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fastify, { FastifyInstance, PrintRoutesOptions } from 'fastify'

import { FastifyHandler } from './Utils/FastifyHandler'
import { HttpMethodTypes } from './Contracts/HttpMethodTypes'
import { HandlerContract } from './Contracts/Context/HandlerContract'
import { MiddlewareTypesContract } from './Contracts/MiddlewareTypesContract'
import { ErrorHandlerContract } from './Contracts/Context/Error/ErrorHandlerContract'
import { HandleHandlerContract } from './Contracts/Context/Middlewares/Handle/HandleHandlerContract'
import { InterceptHandlerContract } from './Contracts/Context/Middlewares/Intercept/InterceptHandlerContract'
import { TerminateHandlerContract } from './Contracts/Context/Middlewares/Terminate/TerminateHandlerContract'

export class Http {
  private readonly server: FastifyInstance

  constructor() {
    this.server = fastify()
  }

  setErrorHandler(handler: ErrorHandlerContract) {
    const fastifyErrorHandler = FastifyHandler.createErrorHandler(handler)

    this.server.setErrorHandler(fastifyErrorHandler)
  }

  getServer(): FastifyInstance {
    return this.server
  }

  getRoutes(options?: PrintRoutesOptions) {
    return this.server.printRoutes(options)
  }

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
        handlerType = 'createDoneHandler'
        break
    }

    this.server.addHook(hookName, FastifyHandler[handlerType](handler))
  }

  async listen(port?: string | number, host?: string): Promise<string> {
    return this.server.listen(port || 1335, host || 'localhost')
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async close(cb?: any): Promise<void> {
    if (cb) {
      return this.server.close(cb)
    }

    return this.server.close()
  }

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
      onResponse: terminators.map(m => FastifyHandler.createDoneHandler(m)),
      onSend: interceptors.map(m => FastifyHandler.createOnSendHandler(m)),
    })
  }

  get(
    url: string,
    handler: HandlerContract,
    middlewares?: MiddlewareTypesContract,
  ) {
    this.route(url, ['GET'], handler, middlewares)
  }

  head(
    url: string,
    handler: HandlerContract,
    middlewares?: MiddlewareTypesContract,
  ) {
    this.route(url, ['HEAD'], handler, middlewares)
  }

  post(
    url: string,
    handler: HandlerContract,
    middlewares?: MiddlewareTypesContract,
  ) {
    this.route(url, ['POST'], handler, middlewares)
  }

  put(
    url: string,
    handler: HandlerContract,
    middlewares?: MiddlewareTypesContract,
  ) {
    this.route(url, ['PUT'], handler, middlewares)
  }

  patch(
    url: string,
    handler: HandlerContract,
    middlewares?: MiddlewareTypesContract,
  ) {
    this.route(url, ['PATCH'], handler, middlewares)
  }

  delete(
    url: string,
    handler: HandlerContract,
    middlewares?: MiddlewareTypesContract,
  ) {
    this.route(url, ['DELETE'], handler, middlewares)
  }

  options(
    url: string,
    handler: HandlerContract,
    middlewares?: MiddlewareTypesContract,
  ) {
    this.route(url, ['OPTIONS'], handler, middlewares)
  }
}
