/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { SendOptions } from '@fastify/static'
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { FastifyHelmetOptions } from '@fastify/helmet'

export type Request = {
  /**
   * The fastify request object.
   */
  request: FastifyRequest

  /**
   * Get the request id.
   *
   * @example
   * ```ts
   * console.log(request.id) // '12345'
   * ```
   */
  get id(): string

  /**
   * Get the request ip.
   *
   * @example
   * ```ts
   * console.log(request.ip) // '192.168.0.1'
   * ```
   */
  get ip(): string

  /**
   * Get the request hostname.
   *
   * @example
   * ```ts
   * console.log(request.hostname) // 'localhost'
   * ```
   */
  get hostname(): string

  /**
   * Get the server port.
   *
   * @example
   * ```ts
   * console.log(request.port) // 3000
   * ```
   */
  get port(): number

  /**
   * Get the http version.
   *
   * @example
   * ```ts
   * console.log(request.version) // 1
   * ```
   */
  get version(): string

  /**
   * Get the request protocol.
   *
   * @example
   * ```ts
   * console.log(request.protocol) // 'http'
   * ```
   */
  get protocol(): 'http' | 'https'

  /**
   * Get the request method.
   *
   * @example
   * ```ts
   * console.log(request.method) // 'GET'
   * ```
   */
  get method(): string

  /**
   * Get the base url from request.
   *
   * @example
   * ```ts
   * console.log(request.baseUrl) // '/users/1'
   * ```
   */
  get baseUrl(): string

  /**
   * Get the base url with host and port info from request.
   *
   * @example
   * ```ts
   * console.log(request.baseHostUrl) // 'http://localhost:3030/users/1'
   * ```
   */
  get baseHostUrl(): string

  /**
   * Get the route url from request.
   *
   * @example
   * ```ts
   * console.log(request.routeUrl) // '/users/:id'
   * ```
   */
  get routeUrl(): string

  /**
   * Get the route url with host and port info from request.
   *
   * @example
   * ```ts
   * console.log(request.routeHostUrl) // 'http://localhost:3030/users/:id'
   * ```
   */
  get routeHostUrl(): string

  /**
   * Get the original url from request.
   *
   * @example
   * ```ts
   * console.log(request.originalUrl) // '/users/1?query=true'
   * ```
   */
  get originalUrl(): string

  /**
   * Get the original url with host and port info from request.
   *
   * @example
   * ```ts
   * console.log(request.originalHostUrl) // 'http://localhost:3000/users/1?query=true'
   * ```
   */
  get originalHostUrl(): string

  /**
   * Get all body from request.
   *
   * @example
   * ```ts
   * const { name, email } = request.body
   * ```
   */
  get body(): any | any[]

  /**
   * Get all params from request.
   *
   * @example
   * ```ts
   * const { id } = request.params
   * ```
   */
  get params(): any

  /**
   * Get all queries from request.
   *
   * @example
   * ```ts
   * const { page, limit } = request.queries
   * ```
   */
  get queries(): any

  /**
   * Get all headers from request.
   *
   * @example
   * ```ts
   * const { accept } = request.headers
   * ```
   */
  get headers(): any

  /**
   * Get a value from the request params or return
   * the default value.
   *
   * @example
   * ```ts
   * const id = request.param('id', '1')
   * ```
   */
  param(param: string, defaultValue?: any): any

  /**
   * Get a value from the request query param or return
   * the default value.
   *
   * @example
   * ```ts
   * const page = request.query('page', '1')
   * ```
   */
  query(query: string, defaultValue?: any): any

  /**
   * Get a value from the request header or return
   * the default value.
   *
   * @example
   * ```ts
   * const accept = request.header('accept', 'application/json')
   * ```
   */
  header(header: string, defaultValue?: any): any

  /**
   * Get a value from the request body or return
   * the default value.
   *
   * @example
   * ```ts
   * const name = request.input('name', 'lenon')
   * ```
   */
  input(key: string, defaultValue?: any): any

  /**
   * Get a value from the request body or return
   * the default value.
   *
   * @example
   * ```ts
   * const name = request.payload('name', 'lenon')
   * ```
   */
  payload(key: string, defaultValue?: any): any

  /**
   * Get only the selected values from the request body.
   *
   * @example
   * ```ts
   * const body = request.only(['name', 'email'])
   * ```
   */
  only(keys: string[]): any

  /**
   * Get all the values from the request body except the
   * selected ones.
   *
   * @example
   * ```ts
   * const body = request.except(['name'])
   * ```
   */
  except(keys: string[]): any
}

export type Response = {
  /**
   * The fastify response object.
   */
  response: FastifyReply

  /**
   * The request object from request context.
   */
  request: Request

  /**
   * Verify if the response has been already sent. Keep
   * in mind that this method will only return `true`
   * after `response.send()`, `response.view()`,
   * `response.sendFile()` or `response.download()` methods
   * call.
   *
   * @example
   * ```ts
   * if (response.sent) {
   *  // do something
   * }
   * ```
   */
  get sent(): boolean

  /**
   * Get the response body sent in response. Keep
   * in mind that this method will only return `true`
   * after `response.send()`, `response.view()`,
   * `response.sendFile()` or `response.download()` methods
   * call.
   *
   * @example
   * ```ts
   * const { createdAt, updatedAt } = response.body
   * ```
   */
  get body(): any | any[]

  /**
   * Get the status code sent in response. Keep
   * in mind that this method will only return `true`
   * after `response.send()`, `response.view()`,
   * `response.sendFile()` or `response.download()` methods
   * call.
   *
   * @example
   * ```ts
   * if (response.statusCode !== 200) {
   *  // do something
   * }
   * ```
   */
  get statusCode(): number

  /**
   * Get the headers set in the response.
   *
   * @example
   * ```ts
   * const headers = response.headers
   * ```
   */
  get headers(): any

  /**
   * Get the time in MS of how much the request has
   * taken to response. Keep in mind that this method
   * will only return `true` after `response.send()`,
   * `response.view()`, `response.sendFile()` or
   * `response.download()` methods call.
   *
   * @example
   * ```ts
   * console.log(response.responseTime) // 1000
   * ```
   */
  get responseTime(): number

  /**
   * Terminate the request sending a view to be rendered.
   *
   * @example
   * ```ts
   * return response.view('welcome', { name: 'lenon' })
   * ```
   */
  view(view: string, data?: any): Promise<Response>

  /**
   * Terminate the request sending the response body or not.
   *
   * @example
   * ```ts
   * return response.send({ name: 'lenon' })
   * ```
   */
  send(data?: any): Promise<Response>

  /**
   * @example
   * ```ts
   * return response.sendFile('img.png')
   * ```
   */
  sendFile(filename: string, filepath?: string): Promise<Response>

  /**
   * @example
   * ```ts
   * return response.sendFile('img.png', { cacheControl: false })
   * ```
   */
  sendFile(filename: string, options?: string | SendOptions): Promise<Response>

  /**
   * @example
   * ```ts
   * return response.sendFile('img.png', Path.tmp(), {
   *  cacheControl: false
   * })
   * ```
   */
  sendFile(
    filename: string,
    filepath?: string,
    options?: SendOptions
  ): Promise<Response>

  /**
   * Terminate the request sending a file.
   *
   * @example
   * ```ts
   * return response.sendFile('img.png')
   * ```
   */
  sendFile(
    filename: string,
    filepath?: string,
    options?: SendOptions
  ): Promise<Response>

  /**
   * @example
   * ```ts
   * return response.download('img.png', 'custom-img.png')
   * ```
   */
  download(filepath: string, filename: string): Promise<Response>

  /**
   * @example
   * ```ts
   * return response.download('img.png', 'custom-img.png', {
   *  cacheControl: false
   * })
   * ```
   */
  download(
    filepath: string,
    filename: string,
    options?: SendOptions
  ): Promise<Response>

  /**
   * Terminate the request sending a file with custom name.
   *
   * @example
   * ```ts
   * return response.download('img.png', 'custom-img.png')
   * ```
   */
  download(
    filepath: string,
    filename: string,
    options?: SendOptions
  ): Promise<Response>

  /**
   * Set the response status code.
   *
   * @example
   * ```ts
   * return response.status(200).send()
   * ```
   */
  status(code: number): Response

  /**
   * Add some header to the response.
   *
   * @example
   * ```ts
   * response.header('content-type', 'application/json')
   *
   * return response.header('accept-encoding', 'gzip').send(user)
   * ```
   */
  header(header: string, value: any): Response

  /**
   * Verify if response has some header.
   *
   * @example
   * ```ts
   * if (response.hasHeader('content-type')) {
   *   // do something
   * }
   * ```
   */
  hasHeader(header: string): boolean

  /**
   * Add some header safely to the response. This means that
   * the header is not going to be added if is already set.
   *
   * @example
   * ```ts
   * response.safeHeader('content-type', 'application/json')
   * ```
   */
  safeHeader(header: string, value: any): Response

  /**
   * Remove some header from the response.
   *
   * @example
   * ```ts
   * response.removeHeader('content-type')
   * ```
   */
  removeHeader(header: string): Response

  /**
   * Redirect the response to other url. You can also set a
   * different status code for the redirect.
   *
   * @example
   * ```ts
   * return response.redirect('users', 304)
   * ```
   */
  redirectTo(url: string, status?: number): Promise<Response>

  /**
   * Apply helmet in response.
   *
   * @example
   * ```ts
   * return response
   *  .helmet({ enableCSPNonces: false })
   *  .view('profile', user)
   * ```
   */
  helmet(options: FastifyHelmetOptions): Response
}

export type Context = {
  /**
   * Retrieve any kind of data from your request by using the
   * request object.
   */
  request: Request
  /**
   * Return a response from the request using the response
   * object.
   */
  response: Response
  /**
   * Save any kind of data that will be shared in all of your
   * request flow. The data defined here will be available in
   * middlewares, route handlers, interceptors and terminators.
   */
  data: any
}

export type RequestHandler = (ctx: Context) => any | Promise<any>
