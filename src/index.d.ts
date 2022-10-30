/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Facade } from '@athenna/ioc'
import { Exception } from '@athenna/common'
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types'
import { FastifyHelmetOptions } from '@fastify/helmet'
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify'
import { RateLimitOptions } from '@fastify/rate-limit'

export const Server: Facade & Http
export const Route: Facade & Router.Router

interface FastifySwaggerSchema {
  hide?: boolean
  deprecated?: boolean
  tags?: string[]
  description?: string
  summary?: string
  body?: any
  response?: any
  consumes?: string[]
  produces?: string[]
  externalDocs?:
    | OpenAPIV2.ExternalDocumentationObject
    | OpenAPIV3.ExternalDocumentationObject
  security?: Array<{ [securityLabel: string]: string[] }>
  /**
   * OpenAPI operation unique identifier
   */
  operationId?: string
}

export class HttpKernel {
  /**
   * The application's global HTTP middlewares.
   *
   * This middlewares are run during every request to your http server.
   *
   * @type {any | Promise<any>}
   */
  get globalMiddlewares(): any | Promise<any>

  /**
   * The application's named HTTP middlewares.
   *
   * Here you define all your named middlewares to use inside routes/http file.
   *
   * @type {Record<string, any | Promise<any>>}
   */
  get namedMiddlewares(): Record<string, any | Promise<any>>

  /**
   * Register all global and named middlewares to the server.
   *
   * @return void
   */
  registerMiddlewares(): Promise<void>

  /**
   * Register cors plugin.
   *
   * @return {Promise<void>}
   */
  registerCors(): Promise<void>

  /**
   * Register helmet plugin.
   *
   * @return {Promise<void>}
   */
  registerHelmet(): Promise<void>

  /**
   * Register swagger plugin.
   *
   * @return {Promise<void>}
   */
  registerSwagger(): Promise<void>

  /**
   * Register rate limit plugin.
   *
   * @return {Promise<void>}
   */
  registerRateLimit(): Promise<void>

  /**
   * Register the default error handler.
   *
   * @return {Promise<void>}
   */
  registerErrorHandler(): Promise<void>

  /**
   * Register log terminate middleware.
   *
   * @return {Promise<void>}
   */
  registerLogMiddleware(): Promise<void>

  /**
   * Register the requestId handle middleware.
   *
   * @return {Promise<void>}
   */
  registerRequestIdMiddleware(): Promise<void>
}

export class HttpExceptionHandler {
  /**
   * Error codes that should be ignored by Log.
   *
   * @type {string[]}
   */
  get ignoreCodes(): string[]

  /**
   * Error statuses that should be ignored by Log.
   *
   * @type {number[]}
   */
  get ignoreStatuses(): number[]

  /**
   * The global exception handler of all HTTP requests.
   *
   * @param ctx
   */
  handle(ctx: ErrorContextContract): Promise<any>
}

export class Http {
  /**
   * Set the fastify error handler.
   *
   * @param {any} handler
   * @return {Http}
   */
  setErrorHandler(handler: ErrorHandlerContract): Http

  /**
   * Register a new fastify plugin.
   *
   * @param {import('fastify').FastifyPluginCallback<import('fastify').FastifyPluginOptions>} plugin
   * @param {import('fastify').FastifyRegisterOptions<import('fastify').FastifyPluginOptions>} [options]
   * @return {Http}
   */
  register(
    plugin: import('fastify').FastifyPluginCallback<
      import('fastify').FastifyPluginOptions
    >,
    options?: import('fastify').FastifyRegisterOptions<
      import('fastify').FastifyPluginOptions
    >,
  ): Http

  /**
   * Register the cors plugin to fastify server.
   *
   * @param {import('@fastify/cors').FastifyCorsOptions} [options]
   * @return {Http}
   */
  registerCors(options?: import('@fastify/cors').FastifyCorsOptions): Http

  /**
   * Register the helmet plugin to fastify server.
   *
   * @param {import('@fastify/helmet').FastifyHelmetOptions} [options]
   * @return {Http}
   */
  registerHelmet(options?: import('@fastify/helmet').FastifyHelmetOptions): Http

  /**
   * Register the swagger plugin to fastify server.
   *
   * @param {import('@fastify/swagger').SwaggerOptions} [options]
   * @return {Http}
   */
  registerSwagger(options?: import('@fastify/swagger').SwaggerOptions): Http

  /**
   * Register the rate limit plugin to fastify server.
   *
   * @param {import('@fastify/rate-limit').RateLimitOptions} [options]
   * @return {Http}
   */
  registerRateLimit(
    options?: import('@fastify/rate-limit').RateLimitOptions,
  ): Http

  /**
   * Get the fastify server instance.
   *
   * @return {import('fastify').FastifyInstance}
   */
  getFastify(): import('fastify').FastifyInstance

  /**
   * Print all routes registered.
   *
   * @param {import('fastify').PrintRoutesOptions} [options]
   * @return {string}
   */
  getRoutes(options?: import('fastify').PrintRoutesOptions): string

  /**
   * Print all routes registered.
   *
   * @param {any} handler
   * @param {'handle'|'intercept'|'terminate'} type
   * @return void
   */
  use(handler: any, type?: 'handle' | 'intercept' | 'terminate'): void

  /**
   * Return a request handler to make internal requests to the Http server.
   *
   * @param {import('fastify').InjectOptions|string} [options]
   * @return {import('light-my-request').Chain,Promise<import('light-my-request').Response>}
   */
  request(
    options?: import('fastify').InjectOptions | string,
  ): import('light-my-request').Chain

  /**
   * Boot the http server to start listening on port and host defined.
   *
   * @param {string|number} [port]
   * @param {string} [host]
   * @return {Promise<string>}
   */
  listen(port?: string | number, host?: string): Promise<string>

  /**
   * Close the http server.
   *
   * @return {Promise<void>}
   */
  close(): Promise<void>

  /**
   * Add a new route to the http server.
   *
   * @param {string} url
   * @param {string[]} methods
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  route(
    url: string,
    methods: string[],
    handler: HandlerContract,
    middlewares?: any,
  ): void

  /**
   * Add a new GET route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  get(url: string, handler: HandlerContract, middlewares?: any): void

  /**
   * Add a new HEAD route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  head(url: string, handler: HandlerContract, middlewares?: any): void

  /**
   * Add a new POST route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  post(url: string, handler: HandlerContract, middlewares?: any): void

  /**
   * Add a new PUT route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  put(url: string, handler: HandlerContract, middlewares?: any): void

  /**
   * Add a new PATCH route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  patch(url: string, handler: HandlerContract, middlewares?: any): void

  /**
   * Add a new DELETE route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  delete(url: string, handler: HandlerContract, middlewares?: any): void

  /**
   * Add a new OPTIONS route to the http server.
   *
   * @param {string} url
   * @param {any} handler
   * @param {any} [middlewares]
   * @return {void}
   */
  options(url: string, handler: HandlerContract, middlewares?: any): void
}

declare module Router {
  class Route {
    name: string
    deleted: boolean

    constructor(
      url: string,
      methods: string[],
      handler: HandlerContract | string,
    )

    prefix(prefix): this

    middleware(
      middleware: string,
      type?: 'handle' | 'intercept' | 'terminate',
      prepend?: boolean,
    ): this

    middleware(
      middleware: MiddlewareContract,
      type?: 'handle' | 'intercept' | 'terminate',
      prepend?: boolean,
    ): this

    middleware(
      middleware: HandleHandlerContract,
      type?: 'handle',
      prepend?: boolean,
    ): this

    middleware(
      middleware: InterceptHandlerContract,
      type?: 'intercept',
      prepend?: boolean,
    ): this

    middleware(
      middleware: TerminateHandlerContract,
      type?: 'terminate',
      prepend?: boolean,
    ): this

    /**
     * Set up all helmet options for route.
     *
     * @param {any} options
     * @return {Route}
     */
    helmet(options: FastifyHelmetOptions): this

    /**
     * Set up all swagger options for route.
     *
     * @param {any} options
     * @return {Route}
     */
    swagger(options: FastifySwaggerSchema): this

    /**
     * Set up all rate limit options for route.
     *
     * @param {any} options
     * @return {Route}
     */
    rateLimit(options: RateLimitOptions): this

    /**
     * Set a summary for the route swagger docs.
     *
     * @param {string} summary
     * @return {Route}
     */
    summary(summary: string): this

    /**
     * Set a description for the route swagger docs.
     *
     * @param {string} description
     * @return {Route}
     */
    description(description: string): this

    /**
     * Set tags for the route swagger docs.
     *
     * @param {string} tags
     * @return {Route}
     */
    tags(...tags: string[]): this

    /**
     * Set body param for the route swagger docs.
     *
     * @param {string} name
     * @param {string} [type]
     * @param {string} [description]
     * @return {Route}
     */
    body(name: string, type?: string, description?: string): Route

    /**
     * Set param for the route swagger docs.
     *
     * @param {string} name
     * @param {string} [type]
     * @param {string} [description]
     * @return {Route}
     */
    param(name, type?: string, description?: string): Route

    /**
     * Set query string for the route swagger docs.
     *
     * @param {string} name
     * @param {string} [type]
     * @param {string} [description]
     * @return {Route}
     */
    queryString(name, type?: string, description?: string): Route

    /**
     * Set response for the route swagger docs.
     *
     * @param {any} response
     * @return {Route}
     */
    response(response: any): this

    /**
     * Set response for the route swagger docs.
     *
     * @param {number} statusCode
     * @param {any} response
     * @return {Route}
     */
    response(statusCode: number, response: any): this

    toJSON(): any
  }

  export class RouteResource {
    routes: Route[]

    constructor(resource: string, controller: any)

    middleware(
      middleware: string,
      type?: 'handle' | 'intercept' | 'terminate',
      prepend?: boolean,
    ): this

    middleware(
      middleware: MiddlewareContract,
      type?: 'handle' | 'intercept' | 'terminate',
      prepend?: boolean,
    ): this

    middleware(
      middleware: HandleHandlerContract,
      type?: 'handle',
      prepend?: boolean,
    ): this

    middleware(
      middleware: InterceptHandlerContract,
      type?: 'intercept',
      prepend?: boolean,
    ): this

    middleware(
      middleware: TerminateHandlerContract,
      type?: 'terminate',
      prepend?: boolean,
    ): this

    /**
     * Register only the methods in the array.
     *
     * @param {string} names
     * @return {RouteResource}
     */
    only(names: string[]): this
    only(...names: string[]): this

    /**
     * Register all methods except the methods in the array.
     *
     * @param {string} names
     * @return {RouteResource}
     */
    except(names: string[]): this
    except(...names: string[]): this

    /**
     * Set up helmet options for route resource.
     *
     * @param {FastifyHelmetOptions} options
     * @return {RouteResource}
     */
    helmet(options: FastifyHelmetOptions): this

    /**
     * Set up helmet options for route resource.
     *
     * @param {string} action
     * @param {FastifyHelmetOptions} options
     * @return {RouteResource}
     */
    helmet(action: string, options: FastifyHelmetOptions): this

    /**
     * Set up swagger options for route resource method.
     *
     * @param {FastifySwaggerSchema} options
     * @return {RouteResource}
     */
    swagger(options: FastifySwaggerSchema): this

    /**
     * Set up swagger options for route resource method.
     *
     * @param {string} action
     * @param {FastifySwaggerSchema} options
     * @return {RouteResource}
     */
    swagger(action: string, options: FastifySwaggerSchema): this

    /**
     * Set up rate limit options for route resource method.
     *
     * @param {RateLimitOptions} options
     * @return {RouteResource}
     */
    rateLimit(options: RateLimitOptions): this

    /**
     * Set up rate limit options for route resource method.
     *
     * @param {string} action
     * @param {RateLimitOptions} options
     * @return {RouteResource}
     */
    rateLimit(action: string, options: RateLimitOptions): this
  }

  export class RouteGroup {
    routes: (Route | RouteResource | RouteGroup)[]

    constructor(routes: (Route | RouteResource | RouteGroup)[])

    prefix(prefix: string): this

    middleware(
      middleware: string,
      type?: 'handle' | 'intercept' | 'terminate',
      prepend?: boolean,
    ): this

    middleware(
      middleware: MiddlewareContract,
      type?: 'handle' | 'intercept' | 'terminate',
      prepend?: boolean,
    ): this

    middleware(
      middleware: HandleHandlerContract,
      type?: 'handle',
      prepend?: boolean,
    ): this

    middleware(
      middleware: InterceptHandlerContract,
      type?: 'intercept',
      prepend?: boolean,
    ): this

    middleware(
      middleware: TerminateHandlerContract,
      type?: 'terminate',
      prepend?: boolean,
    ): this

    /**
     * Set up helmet options for route group.
     *
     * @param {any} options
     * @return {RouteGroup}
     */
    helmet(options: FastifyHelmetOptions): this

    /**
     * Set up swagger options for route group.
     *
     * @param {any} options
     * @return {RouteGroup}
     */
    swagger(options: FastifySwaggerSchema): this

    /**
     * Set up rate limit options for route group.
     *
     * @param {any} options
     * @return {RouteGroup}
     */
    rateLimit(options: RateLimitOptions): this
  }

  export class Router {
    /**
     * List the routes registered.
     *
     * @return {any}
     */
    listRoutes(): any

    /**
     * Set the controller instance.
     *
     * @param {any} controller
     * @return {Router}
     */
    controller(controller: any): Router

    /**
     * Register a new route.
     *
     * @param {string} url
     * @param {string[]} methods
     * @param {string|any} handler
     * @return {Route}
     */
    route(
      url: string,
      methods: string[],
      handler: string | HandlerContract,
    ): Route

    /**
     * Register a new vanila route using fastify options
     * directly.
     *
     * @param {import('fastify').RouteOptions} options
     * @return {void}
     */
    vanilaRoute(options: RouteOptions): void

    /**
     * Creates a new route group.
     *
     * @param {() => void} callback
     * @return {RouteGroup}
     */
    group(callback: () => void): RouteGroup

    /**
     * Creates a new route resource.
     *
     * @param {string} resource
     * @param {any} controller
     * @return {RouteResource}
     */
    resource(resource: string, controller: any): RouteResource

    /**
     * Creates a new redirect route.
     *
     * @param {string} url
     * @param {string} redirectTo
     * @param {number} [status]
     * @return {Route}
     */
    redirect(url: string, redirectTo: string, status?: number): Route

    /**
     * Register a new get method route.
     *
     * @param {string} url
     * @param {string|any} handler
     * @return {Route}
     */
    get(url: string, handler: string | HandlerContract): Route

    /**
     * Register a new head method route.
     *
     * @param {string} url
     * @param {string|any} handler
     * @return {Route}
     */
    head(url: string, handler: string | HandlerContract): Route

    /**
     * Register a new post method route.
     *
     * @param {string} url
     * @param {string|any} handler
     * @return {Route}
     */
    post(url: string, handler: string | HandlerContract): Route

    /**
     * Register a new put method route.
     *
     * @param {string} url
     * @param {string|any} handler
     * @return {Route}
     */
    put(url: string, handler: string | HandlerContract): Route

    /**
     * Register a new patch method route.
     *
     * @param {string} url
     * @param {string|any} handler
     * @return {Route}
     */
    patch(url: string, handler: string | HandlerContract): Route

    /**
     * Register a new delete method route.
     *
     * @param {string} url
     * @param {string|any} handler
     * @return {Route}
     */
    delete(url: string, handler: string | HandlerContract): Route

    /**
     * Register a new options method route.
     *
     * @param {string} url
     * @param {string|any} handler
     * @return {Route}
     */
    options(url: string, handler: string | HandlerContract): Route

    /**
     * Register a new route with all methods.
     *
     * @param {string} url
     * @param {string|any} handler
     * @return {Route}
     */
    any(url: string, handler: string | HandlerContract): Route

    /**
     * Register all the routes inside the Server.
     *
     * @return {Route}
     */
    register(): Route

    /**
     * Transform the routes to JSON Object.
     *
     * @param {any[]} [routes]
     */
    toRoutesJSON(routes?: any[]): any
  }
}

export interface RequestContract {
  /**
   * Get the request ip.
   *
   * @return {string}
   */
  get ip(): string
  /**
   * Get the request method.
   *
   * @return {string}
   */
  get method(): string

  /**
   * Get the host url from request.
   *
   * @return {string}
   */
  get hostUrl(): string

  /**
   * Get the base request url.
   *
   * @return {string}
   */
  get baseUrl(): string

  /**
   * Get the original request url.
   *
   * @return {string}
   */
  get originalUrl(): string

  /**
   * Get all body from request.
   *
   * @return {any}
   */
  get body(): any

  /**
   * Get all params from request.
   *
   * @return {any}
   */
  get params(): any

  /**
   * Get all queries from request.
   *
   * @return {any}
   */
  get queries(): any

  /**
   * Get all headers from request.
   *
   * @return {any}
   */
  get headers(): any

  /**
   * Get a value from the request params or the default value.
   *
   * @param {string} param
   * @param {string} [defaultValue]
   * @return {any}
   */
  param(param, defaultValue): any

  /**
   * Get a value from the request query param or the default value.
   *
   * @param {string} query
   * @param {string} [defaultValue]
   * @return {any}
   */
  query(query, defaultValue): any

  /**
   * Get a value from the request header or the default value.
   *
   * @param {string} header
   * @param {string} [defaultValue]
   * @return {any}
   */
  header(header, defaultValue): any

  /**
   * Get a value from the request body or the default value.
   *
   * @param {string} payload
   * @param {string} [defaultValue]
   * @return {any}
   */
  payload(payload, defaultValue): any
  /**
   * Get the default fastify request object.
   *
   * @return {import('fastify').FastifyRequest}
   */
  getFastifyRequest(): FastifyRequest
}

export interface ResponseContract {
  /**
   * Terminate the request sending the response body.
   *
   * @param {any} [data]
   * @return {void}
   */
  send(data?: any): Promise<void>

  /**
   * Terminate the request sending the response body.
   *
   * @param {any} [data]
   * @return {void}
   */
  json(data?: any): Promise<void>

  /**
   * Apply helmet in response.
   *
   * @param {import('@fastify/helmet').FastifyHelmetOptions} [options]
   * @return {void}
   */
  helmet(options?: FastifyHelmetOptions): Promise<void>

  /**
   * Set the response status code.
   *
   * @param {number} code
   * @return {Response}
   */
  status(code: number): this

  /**
   * Remove some header from the response.
   *
   * @param {string} header
   * @return {Response}
   */
  removeHeader(header: string): this

  /**
   * Add some header to the response.
   *
   * @param {string} header
   * @param {any} value
   * @return {Response}
   */
  header(header: string, value: any): this

  /**
   * Only add some header to the response if it's not defined yet.
   *
   * @param {string} header
   * @param {any} value
   * @return {Response}
   */
  safeHeader(header: string, value: any): this

  /**
   * Redirect the response to other url with different status code.
   *
   * @param {string} url
   * @return {void}
   */
  redirectTo(url: string): Promise<void> | void

  /**
   * Redirect the response to other url with different status code.
   *
   * @param {string} url
   * @param {number} statusCode
   * @return {void}
   */
  redirectTo(url: string, statusCode: number): Promise<void>

  /**
   * Get the default fastify response object.
   *
   * @return {import('fastify').FastifyReply}
   */
  getFastifyResponse(): FastifyReply
}

export class HttpLoader {
  /**
   * Return all commands from http package.
   *
   * @return {any[]}
   */
  static loadCommands(): any[]

  /**
   * Return all custom templates from http package.
   *
   * @return {any[]}
   */
  static loadTemplates(): any[]
}

export interface ContextContract {
  request: RequestContract
  response: ResponseContract
  data: any
  params: any
  queries: any
}

export interface ErrorContextContract {
  request: RequestContract
  response: ResponseContract
  params: any
  queries: any
  data: any
  error: any
}

export interface HandleContextContract {
  request: RequestContract
  response: ResponseContract
  data: any
  params: any
  queries: any
}

export interface InterceptContextContract {
  request: RequestContract
  response: ResponseContract
  params: any
  queries: any
  body: any
  status: number
  data: any
}

export interface TerminateContextContract {
  request: RequestContract
  response: ResponseContract
  data: any
  params: any
  queries: any
  body: any
  headers: any
  status: number
  responseTime: number
}

export interface ErrorHandlerContract {
  (ctx?: ErrorContextContract): Promise<any> | any
}

export interface HandlerContract {
  (ctx?: ContextContract): Promise<any> | any
}

export interface HandleHandlerContract {
  (ctx?: InterceptContextContract): Promise<any> | any
}

export interface InterceptHandlerContract {
  (ctx?: InterceptContextContract): Promise<any> | any
}

export interface TerminateHandlerContract {
  (ctx?: TerminateContextContract): Promise<any> | any
}

export interface MiddlewareContract {
  handle?: HandleHandlerContract
  intercept?: InterceptHandlerContract
  terminate?: TerminateHandlerContract
}

export class HttpException extends Exception {
  /**
   * Creates a new instance of HttpException.
   *
   * @example
   *  throw new HttpException()
   *  This exception uses the 500 status code and the "E_HTTP_ERROR" code.
   *
   * @param {string} [content]
   * @param {number} [status]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(
    content?: string,
    status?: number,
    code?: string,
    help?: string | null,
  )
}

export class BadGatewayException extends Exception {
  /**
   * Creates a new instance of BadGatewayException.
   *
   * @example
   *  throw new BadGatewayException()
   *  This exception uses the 502 status code and the "E_BAD_GATEWAY_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(content?: string, code?: string, help?: string | null)
}

export class BadRequestException extends Exception {
  /**
   * Creates a new instance of BadRequestException.
   *
   * @example
   *  throw new BadRequestException()
   *  This exception uses the 400 status code and the "E_BAD_REQUEST_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(content?: string, code?: string, help?: string | null)
}

export class ForbiddenException extends Exception {
  /**
   * Creates a new instance of ForbiddenException.
   *
   * @example
   *  throw new ForbiddenException()
   *  This exception uses the 403 status code and the "E_FORBIDDEN_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(content?: string, code?: string, help?: string | null)
}

export class InternalServerException extends Exception {
  /**
   * Creates a new instance of InternalServerException.
   *
   * @example
   *  throw new InternalServerException()
   *  This exception uses the 500 status code and the "E_INTERNAL_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(content?: string, code?: string, help?: string | null)
}

export class MethodNotAllowedException extends Exception {
  /**
   * Creates a new instance of MethodNotAllowedException.
   *
   * @example
   *  throw new MethodNotAllowedException()
   *  This exception uses the 405 status code and the "E_METHOD_NOT_ALLOWED_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(content?: string, code?: string, help?: string | null)
}

export class NotAcceptableException extends Exception {
  /**
   * Creates a new instance of NotAcceptableException.
   *
   * @example
   *  throw new NotAcceptableException()
   *  This exception uses the 406 status code and the "E_NOT_ACCEPTABLE_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(content?: string, code?: string, help?: string | null)
}

export class NotFoundException extends Exception {
  /**
   * Creates a new instance of NotFoundException.
   *
   * @example
   *  throw new NotFoundException()
   *  This exception uses the 404 status code and the "E_NOT_FOUND_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(content?: string, code?: string, help?: string | null)
}

export class NotImplementedException extends Exception {
  /**
   * Creates a new instance of NotImplementedException.
   *
   * @example
   *  throw new NotImplementedException()
   *  This exception uses the 501 status code and the "E_NOT_IMPLEMENTED_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(content?: string, code?: string, help?: string | null)
}

export class PayloadTooLargeException extends Exception {
  /**
   * Creates a new instance of PayloadTooLargeException.
   *
   * @example
   *  throw new PayloadTooLargeException()
   *  This exception uses the 413 status code and the "E_PAYLOAD_TOO_LARGE_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(content?: string, code?: string, help?: string | null)
}

export class RequestTimeoutException extends Exception {
  /**
   * Creates a new instance of RequestTimeoutException.
   *
   * @example
   *  throw new RequestTimeoutException()
   *  This exception uses the 408 status code and the "E_REQUEST_TIMEOUT_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(content?: string, code?: string, help?: string | null)
}

export class ServiceUnavailableException extends Exception {
  /**
   * Creates a new instance of ServiceUnavailableException.
   *
   * @example
   *  throw new ServiceUnavailableException()
   *  This exception uses the 503 status code and the "E_SERVICE_UNAVAILABLE_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(content?: string, code?: string, help?: string | null)
}

export class UnauthorizedException extends Exception {
  /**
   * Creates a new instance of UnauthorizedException.
   *
   * @example
   *  throw new UnauthorizedException()
   *  This exception uses the 401 status code and the "E_UNAUTHORIZED_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(content?: string, code?: string, help?: string | null)
}

export class UnprocessableEntityException extends Exception {
  /**
   * Creates a new instance of UnprocessableEntityException.
   *
   * @example
   *  throw new UnprocessableEntityException()
   *  This exception uses the 422 status code and the "E_UNPROCESSABLE_ENTITY_ERROR" code.
   *
   * @param {string} [content]
   * @param {string} [code]
   * @param {string|null} [help]
   */
  constructor(content?: string, code?: string, help?: string | null)
}
