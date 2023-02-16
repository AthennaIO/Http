/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fastify, {
  InjectOptions,
  FastifyInstance,
  PrintRoutesOptions,
  FastifyListenOptions,
  FastifyServerOptions,
  FastifyPluginCallback,
  FastifyRegisterOptions,
} from 'fastify'

import {
  InterceptHandler,
  TerminateHandler,
} from '#src/Types/Middlewares/MiddlewareHandler'

import { AddressInfo } from 'node:net'
import { Options } from '@athenna/common'
import { Chain, Response } from 'light-my-request'
import { RouteOptions } from '#src/Types/Router/RouteOptions'
import { RequestHandler } from '#src/Types/Contexts/Context'
import { FastifyHandler } from '#src/Handlers/FastifyHandler'
import { ErrorHandler } from '#src/Types/Contexts/ErrorContext'

export class Server {
  /**
   * Holds the fastify server instance.
   */
  public fastify: FastifyInstance

  /**
   * Set if the Http server is listening for new requests.
   */
  public isListening: boolean

  public constructor(options?: FastifyServerOptions) {
    this.fastify = fastify.fastify(options)
    this.isListening = false
  }

  /**
   * Get the representation of the internal radix tree used by the
   * router.
   */
  public getRoutes(options?: PrintRoutesOptions) {
    return this.fastify.printRoutes(options)
  }

  /**
   * Get the address info of the server. This method will return the
   * port used to listen the server, the family (IPv4, IPv6) and the
   * server address (127.0.0.1).
   */
  public getAddressInfo(): AddressInfo {
    return this.fastify.server.address() as AddressInfo
  }

  /**
   * Get the port where the server is running.
   */
  public getPort() {
    return this.getAddressInfo().port
  }

  /**
   * Get the host where the server is running.
   */
  public getHost() {
    return this.getAddressInfo().address
  }

  /**
   * Get the fastify version that is running the server.
   */
  public getFastifyVersion() {
    return this.fastify.version
  }

  /**
   * Set the error handler to handle errors that happens inside the server.
   */
  public setErrorHandler(handler: ErrorHandler): Server {
    this.fastify.setErrorHandler(FastifyHandler.error(handler))

    return this
  }

  /**
   * Register a plugin inside the fastify server.
   */
  public async registerPlugin<T = any>(
    plugin: FastifyPluginCallback,
    options?: FastifyRegisterOptions<T>,
  ): Promise<Server> {
    await this.fastify.register(plugin, options)

    return this
  }

  public use(handler: RequestHandler): Server
  public use(handler: RequestHandler, type: 'handle'): Server
  public use(handler: InterceptHandler, type: 'intercept'): Server
  public use(handler: TerminateHandler, type: 'terminate'): Server

  /**
   * Register a middleware inside the server.
   */
  public use(
    handler: RequestHandler | InterceptHandler | TerminateHandler,
    type: 'handle' | 'intercept' | 'terminate' = 'handle',
  ): Server {
    let hookName: any = 'preHandler'

    switch (type) {
      case 'intercept':
        hookName = 'onSend'
        break
      case 'terminate':
        hookName = 'onResponse'
        break
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.fastify.addHook(hookName, FastifyHandler[type](handler))

    return this
  }

  public request(options?: InjectOptions): Chain
  public request(url: string): Promise<Response>

  /**
   * Return a request handler to make internal requests to the Http server.
   */
  public request(options?: InjectOptions | string): Chain | Promise<Response> {
    if (!options) {
      return this.fastify.inject()
    }

    return this.fastify.inject(options)
  }

  /**
   * Make the server start listening for requests.
   */
  public async listen(options: FastifyListenOptions) {
    return this.fastify.listen(options).then(() => (this.isListening = true))
  }

  /**
   * Close the server,
   */
  public async close() {
    if (!this.isListening) {
      return
    }

    await this.fastify.close().then(() => (this.isListening = true))
  }

  /**
   * Add a new route to the http server.
   */
  public route(options: RouteOptions) {
    options = Options.create(options, {
      handlers: [],
      terminators: [],
      interceptors: [],
    })

    this.fastify.route({
      url: options.url,
      method: options.methods,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      handler: FastifyHandler.request(options.handler),
      preHandler: options.handlers.map(m => FastifyHandler.handle(m)),
      onSend: options.interceptors.map(m => FastifyHandler.intercept(m)),
      onResponse: options.terminators.map(m => FastifyHandler.terminate(m)),
      ...options.fastifyOptions,
    })
  }

  /**
   * Add a new GET route to the http server.
   */
  public get(options: Omit<RouteOptions, 'methods'>) {
    this.route({ ...options, methods: ['GET'] })
  }

  /**
   * Add a new HEAD route to the http server.
   */
  public head(options: Omit<RouteOptions, 'methods'>) {
    this.route({ ...options, methods: ['HEAD'] })
  }

  /**
  /**
   * Add a new POST route to the http server.
   */
  public post(options: Omit<RouteOptions, 'methods'>) {
    this.route({ ...options, methods: ['POST'] })
  }

  /**
   * Add a new PUT route to the http server.
   */
  public put(options: Omit<RouteOptions, 'methods'>) {
    this.route({ ...options, methods: ['PUT'] })
  }

  /**
   * Add a new PATCH route to the http server.
   */
  public patch(options: Omit<RouteOptions, 'methods'>) {
    this.route({ ...options, methods: ['PATCH'] })
  }

  /**
   * Add a new DELETE route to the http server.
   */
  public delete(options: Omit<RouteOptions, 'methods'>) {
    this.route({ ...options, methods: ['DELETE'] })
  }

  /**
   * Add a new OPTIONS route to the http server.
   */
  public options(options: Omit<RouteOptions, 'methods'>) {
    this.route({ ...options, methods: ['OPTIONS'] })
  }
}
