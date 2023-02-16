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
  FastifyRegisterOptions,
  LightMyRequestChain,
  LightMyRequestResponse,
} from 'fastify'

import {
  InterceptHandler,
  TerminateHandler,
} from '#src/Types/Middlewares/MiddlewareHandler'

import { AddressInfo } from 'node:net'
import { Options } from '@athenna/common'
import { RequestHandler } from '#src/Types/Contexts/Context'
import { RouteOptions } from '#src/Types/Router/RouteOptions'
import { FastifyHandler } from '#src/Handlers/FastifyHandler'
import { ServerContract } from '#src/Contracts/ServerContract'
import { ErrorHandler } from '#src/Types/Contexts/ErrorContext'
import { MiddlewareTypes } from '#src/Types/Middlewares/MiddlewareTypes'

export class ServerImpl implements ServerContract {
  public fastify: FastifyInstance

  public isListening: boolean

  public constructor(options?: FastifyServerOptions) {
    this.fastify = fastify.fastify(options)
    this.isListening = false
  }

  public getRoutes(options?: PrintRoutesOptions): string {
    return this.fastify.printRoutes(options)
  }

  public getAddressInfo(): AddressInfo {
    return this.fastify.server.address() as AddressInfo
  }

  public getPort(): number {
    return this.getAddressInfo()?.port
  }

  public getHost(): string {
    return this.getAddressInfo()?.address
  }

  public getFastifyVersion(): string {
    return this.fastify.version
  }

  public setErrorHandler(handler: ErrorHandler): ServerContract {
    this.fastify.setErrorHandler(FastifyHandler.error(handler))

    return this
  }

  public async plugin<T = any>(
    plugin: any,
    options?: FastifyRegisterOptions<T>,
  ): Promise<ServerContract> {
    await this.fastify.register(plugin, options)

    return this
  }

  public use(
    handler: RequestHandler | InterceptHandler | TerminateHandler,
    type: MiddlewareTypes = 'handle',
  ): ServerContract {
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

  public async listen(options: FastifyListenOptions): Promise<any> {
    return this.fastify.listen(options).then(() => (this.isListening = true))
  }

  public async close(): Promise<void> {
    if (!this.isListening) {
      return
    }

    await this.fastify.close().then(() => (this.isListening = true))
  }

  public route(options: RouteOptions): void {
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

  public get(options: Omit<RouteOptions, 'methods'>): void {
    this.route({ ...options, methods: ['GET'] })
  }

  public head(options: Omit<RouteOptions, 'methods'>): void {
    this.route({ ...options, methods: ['HEAD'] })
  }

  public post(options: Omit<RouteOptions, 'methods'>): void {
    this.route({ ...options, methods: ['POST'] })
  }

  public put(options: Omit<RouteOptions, 'methods'>): void {
    this.route({ ...options, methods: ['PUT'] })
  }

  public patch(options: Omit<RouteOptions, 'methods'>): void {
    this.route({ ...options, methods: ['PATCH'] })
  }

  public delete(options: Omit<RouteOptions, 'methods'>): void {
    this.route({ ...options, methods: ['DELETE'] })
  }

  public options(options: Omit<RouteOptions, 'methods'>): void {
    this.route({ ...options, methods: ['OPTIONS'] })
  }
}
