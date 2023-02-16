/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  InjectOptions,
  FastifyInstance,
  LightMyRequestChain,
  LightMyRequestResponse,
  PrintRoutesOptions,
  FastifyListenOptions,
  FastifyPluginCallback,
  FastifyRegisterOptions,
  FastifyPluginAsync,
} from 'fastify'

import {
  InterceptHandler,
  TerminateHandler,
} from '#src/Types/Middlewares/MiddlewareHandler'

import { AddressInfo } from 'node:net'
import { RequestHandler } from '#src/Types/Contexts/Context'
import { RouteOptions } from '#src/Types/Router/RouteOptions'
import { ErrorHandler } from '#src/Types/Contexts/ErrorContext'

export interface ServerContract {
  /**
   * Holds the fastify server instance.
   */
  fastify: FastifyInstance

  /**
   * Set if the Http server is listening for new requests.
   */
  isListening: boolean

  /**
   * Get the representation of the internal radix tree used by the
   * router.
   */
  getRoutes(options?: PrintRoutesOptions): string

  /**
   * Get the address info of the server. This method will return the
   * port used to listen the server, the family (IPv4, IPv6) and the
   * server address (127.0.0.1).
   */
  getAddressInfo(): AddressInfo

  /**
   * Get the port where the server is running.
   */
  getPort(): number

  /**
   * Get the host where the server is running.
   */
  getHost(): string

  /**
   * Get the fastify version that is running the server.
   */
  getFastifyVersion(): string

  /**
   * Set the error handler to handle errors that happens inside the server.
   */
  setErrorHandler(handler: ErrorHandler): ServerContract

  /**
   * Register a plugin inside the fastify server.
   */
  plugin<T = any>(
    plugin: FastifyPluginCallback | FastifyPluginAsync,
    options?: FastifyRegisterOptions<T>,
  ): Promise<ServerContract>

  /**
   * Register a handler middleware.
   */
  use(handler: RequestHandler): ServerContract

  /**
   * Register a handler middleware.
   */
  use(handler: RequestHandler, type: 'handle'): ServerContract

  /**
   * Register a intercept middleware.
   */
  use(handler: InterceptHandler, type: 'intercept'): ServerContract

  /**
   * Register a terminate middleware.
   */
  use(handler: TerminateHandler, type: 'terminate'): ServerContract

  /**
   * Return a request handler to make internal requests to the Http server.
   */
  request(): LightMyRequestChain

  /**
   * Return a request handler to make internal requests to the Http server.
   */
  request(options: InjectOptions): Promise<LightMyRequestResponse>

  /**
   * Return a request handler to make internal requests to the Http server.
   */
  request(
    options?: InjectOptions,
  ): LightMyRequestChain | Promise<LightMyRequestResponse>

  /**
   * Make the server start listening for requests.
   */
  listen(options: FastifyListenOptions): Promise<any>

  /**
   * Close the server,
   */
  close(): Promise<void>

  /**
   * Add a new route to the http server.
   */
  route(options: RouteOptions): void

  /**
   * Add a new GET route to the http server.
   */
  get(options: Omit<RouteOptions, 'methods'>): void

  /**
   * Add a new HEAD route to the http server.
   */
  head(options: Omit<RouteOptions, 'methods'>): void

  /**
  /**
   * Add a new POST route to the http server.
   */
  post(options: Omit<RouteOptions, 'methods'>): void

  /**
   * Add a new PUT route to the http server.
   */
  put(options: Omit<RouteOptions, 'methods'>): void

  /**
   * Add a new PATCH route to the http server.
   */
  patch(options: Omit<RouteOptions, 'methods'>): void

  /**
   * Add a new DELETE route to the http server.
   */
  delete(options: Omit<RouteOptions, 'methods'>): void

  /**
   * Add a new OPTIONS route to the http server.
   */
  options(options: Omit<RouteOptions, 'methods'>): void
}
