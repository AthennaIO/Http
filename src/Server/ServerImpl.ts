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
  LightMyRequestChain,
  LightMyRequestResponse,
} from 'fastify'

import {
  InterceptHandler,
  TerminateHandler,
} from '#src/Types/Middlewares/MiddlewareHandler'

import { AddressInfo } from 'node:net'
import { Options } from '@athenna/common'
import { RouteJSON } from '#src/Types/Router/RouteJSON'
import { RequestHandler } from '#src/Types/Contexts/Context'
import { FastifyHandler } from '#src/Handlers/FastifyHandler'
import { ErrorHandler } from '#src/Types/Contexts/ErrorContext'

export class ServerImpl {
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
  public getRoutes(options?: PrintRoutesOptions): string {
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
  public getPort(): number {
    return this.getAddressInfo()?.port
  }

  /**
   * Get the host where the server is running.
   */
  public getHost(): string {
    return this.getAddressInfo()?.address
  }

  /**
   * Get the fastify version that is running the server.
   */
  public getFastifyVersion(): string {
    return this.fastify.version
  }

  /**
   * Set the error handler to handle errors that happens inside the server.
   */
  public setErrorHandler(handler: ErrorHandler): ServerImpl {
    this.fastify.setErrorHandler(FastifyHandler.error(handler))

    return this
  }

  /**
   * Register a plugin inside the fastify server.
   */
  public async plugin(plugin: any, options?: any): Promise<void> {
    await this.fastify.register(plugin, options)
  }

  /**
   * Create a middleware that will be executed before the request gets
   * inside the route handler.
   */
  public middleware(handler: RequestHandler): ServerImpl {
    this.fastify.addHook('preHandler', FastifyHandler.handle(handler))

    return this
  }

  /**
   * Create an interceptor that will be executed before the response
   * is returned. At this point you can still make modifications in the
   * response.
   */
  public intercept(handler: InterceptHandler): ServerImpl {
    this.fastify.addHook('onSend', FastifyHandler.intercept(handler))

    return this
  }

  /**
   * Create and terminator that will be executed after the response
   * is returned. At this point you cannot make modifications in the
   * response.
   */
  public terminate(handler: TerminateHandler): ServerImpl {
    this.fastify.addHook('onResponse', FastifyHandler.terminate(handler))

    return this
  }

  /**
   * Return a request handler to make internal requests to the Http server.
   */
  public request(): LightMyRequestChain

  /**
   * Return a request handler to make internal requests to the Http server.
   */
  public request(options: InjectOptions): Promise<LightMyRequestResponse>

  /**
   * Return a request handler to make internal requests to the Http server.
   */
  public request(options?: InjectOptions) {
    if (!options) {
      return this.fastify.inject()
    }

    return this.fastify.inject(options)
  }

  /**
   * Make the server start listening for requests.
   */
  public async listen(options: FastifyListenOptions): Promise<any> {
    return this.fastify.listen(options).then(() => (this.isListening = true))
  }

  /**
   * Close the server,
   */
  public async close(): Promise<void> {
    if (!this.isListening) {
      return
    }

    await this.fastify.close().then(() => (this.isListening = true))
  }

  /**
   * Add a new route to the http server.
   */
  public route(options: RouteJSON): void {
    if (!options.middlewares) {
      options.middlewares = {} as any
    }

    options.middlewares = Options.create(options.middlewares, {
      middlewares: [],
      terminators: [],
      interceptors: [],
    })

    this.fastify.route({
      url: options.url,
      method: options.methods,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      handler: FastifyHandler.request(options.handler),
      preHandler: options.middlewares.middlewares.map(m =>
        FastifyHandler.handle(m),
      ),
      onSend: options.middlewares.interceptors.map(m =>
        FastifyHandler.intercept(m),
      ),
      onResponse: options.middlewares.terminators.map(m =>
        FastifyHandler.terminate(m),
      ),
      ...options.fastify,
    })
  }

  /**
   * Add a new GET route to the http server.
   */
  public get(options: Omit<RouteJSON, 'methods'>): void {
    this.route({ ...options, methods: ['GET'] })
  }

  /**
   * Add a new HEAD route to the http server.
   */
  public head(options: Omit<RouteJSON, 'methods'>): void {
    this.route({ ...options, methods: ['HEAD'] })
  }

  /**
   * Add a new POST route to the http server.
   */
  public post(options: Omit<RouteJSON, 'methods'>): void {
    this.route({ ...options, methods: ['POST'] })
  }

  /**
   * Add a new PUT route to the http server.
   */
  public put(options: Omit<RouteJSON, 'methods'>): void {
    this.route({ ...options, methods: ['PUT'] })
  }

  /**
   * Add a new PATCH route to the http server.
   */
  public patch(options: Omit<RouteJSON, 'methods'>): void {
    this.route({ ...options, methods: ['PATCH'] })
  }

  /**
   * Add a new DELETE route to the http server.
   */
  public delete(options: Omit<RouteJSON, 'methods'>): void {
    this.route({ ...options, methods: ['DELETE'] })
  }

  /**
   * Add a new OPTIONS route to the http server.
   */
  public options(options: Omit<RouteJSON, 'methods'>): void {
    this.route({ ...options, methods: ['OPTIONS'] })
  }
}
