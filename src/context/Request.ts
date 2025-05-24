/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type {
  SavedMultipartFile,
  FastifyMultipartBaseOptions
} from '@fastify/multipart'

import type { AddressInfo } from 'node:net'
import type { FastifyRequest } from 'fastify'
import { Is, Json, Macroable } from '@athenna/common'
import type { BusboyConfig } from '@fastify/busboy'

export class Request extends Macroable {
  /**
   * The fastify request object.
   */
  private request: FastifyRequest

  public constructor(request: FastifyRequest) {
    super()

    this.request = request
  }

  /**
   * Get the request id.
   *
   * @example
   * ```ts
   * console.log(request.id) // '12345'
   * ```
   */
  public get id(): string {
    return this.request.id
  }

  /**
   * Get the request ip.
   *
   * @example
   * ```ts
   * console.log(request.ip) // '192.168.0.1'
   * ```
   */
  public get ip(): string {
    return this.request.ip
  }

  /**
   * Get the request hostname.
   *
   * @example
   * ```ts
   * console.log(request.hostname) // 'localhost'
   * ```
   */
  public get hostname(): string {
    return this.request.hostname
  }

  /**
   * Get the server port.
   *
   * @example
   * ```ts
   * console.log(request.port) // 3000
   * ```
   */
  public get port(): number {
    return this.getAddressInfo().port
  }

  /**
   * Get the http version.
   *
   * @example
   * ```ts
   * console.log(request.version) // 1
   * ```
   */
  public get version(): string {
    return this.request.raw.httpVersion
  }

  /**
   * Get the request protocol.
   *
   * @example
   * ```ts
   * console.log(request.protocol) // 'http'
   * ```
   */
  public get protocol(): 'http' | 'https' {
    return this.request.protocol
  }

  /**
   * Get the request method.
   *
   * @example
   * ```ts
   * console.log(request.method) // 'GET'
   * ```
   */
  public get method(): string {
    return this.request.method
  }

  /**
   * Get the route name defined in your route file.
   *
   * @example
   * ```ts
   * console.log(request.routeName) // 'users'
   * ```
   */
  public get routeName(): string {
    // eslint-disable-next-line
    // @ts-ignore
    return this.request.routeOptions.config.name
  }

  /**
   * Get the base url from request.
   *
   * @example
   * ```ts
   * console.log(request.baseUrl) // '/users/1'
   * ```
   */
  public get baseUrl(): string {
    return this.request.url.split('?')[0]
  }

  /**
   * Get the base url with host and port info from request.
   *
   * @example
   * ```ts
   * console.log(request.baseHostUrl) // 'http://localhost:3030/users/1'
   * ```
   */
  public get baseHostUrl(): string {
    return this.getHostUrlFor(this.baseUrl)
  }

  /**
   * Get the route url from request.
   *
   * @example
   * ```ts
   * console.log(request.routeUrl) // '/users/:id'
   * ```
   */
  public get routeUrl(): string {
    return this.request.routeOptions.url
  }

  /**
   * Get the route url with host and port info from request.
   *
   * @example
   * ```ts
   * console.log(request.routeHostUrl) // 'http://localhost:3030/users/:id'
   * ```
   */
  public get routeHostUrl(): string {
    return this.getHostUrlFor(this.routeUrl)
  }

  /**
   * Get the original url from request.
   *
   * @example
   * ```ts
   * console.log(request.originalUrl) // '/users/1?query=true'
   * ```
   */
  public get originalUrl(): string {
    return this.request.url
  }

  /**
   * Get the original url with host and port info from request.
   *
   * @example
   * ```ts
   * console.log(request.originalHostUrl) // 'http://localhost:3000/users/1?query=true'
   * ```
   */
  public get originalHostUrl(): string {
    return this.getHostUrlFor(this.originalUrl)
  }

  /**
   * Get all body from request.
   *
   * @example
   * ```ts
   * const { name, email } = request.body
   * ```
   */
  public get body(): any | any[] {
    return this.request.body || {}
  }

  /**
   * Get all params from request.
   *
   * @example
   * ```ts
   * const { id } = request.params
   * ```
   */
  public get params(): any {
    return this.request.params || {}
  }

  /**
   * Get all queries from request.
   *
   * @example
   * ```ts
   * const { page, limit } = request.queries
   * ```
   */
  public get queries(): any {
    return this.request.query || {}
  }

  /**
   * Get all headers from request.
   *
   * @example
   * ```ts
   * const { accept } = request.headers
   * ```
   */
  public get headers(): any {
    return this.request.headers || {}
  }

  /**
   * Get a value from the request params or return
   * the default value.
   *
   * @example
   * ```ts
   * const id = request.param('id', '1')
   * ```
   */
  public param(param: string, defaultValue?: any): any {
    return Json.get(this.params, param, defaultValue)
  }

  /**
   * Get a value from the request query param or return
   * the default value.
   *
   * @example
   * ```ts
   * const page = request.query('page', '1')
   * ```
   */
  public query(query: string, defaultValue?: any): any {
    return Json.get(this.queries, query, defaultValue)
  }

  /**
   * Get a value from the request header or return
   * the default value.
   *
   * @example
   * ```ts
   * const accept = request.header('accept', 'application/json')
   * ```
   */
  public header(header: string, defaultValue?: any): any {
    return Json.get(this.headers, header, defaultValue)
  }

  /**
   * Get a value from the request body or return
   * the default value.
   *
   * @example
   * ```ts
   * const name = request.input('name', 'lenon')
   * ```
   */
  public input(key: string, defaultValue?: any): any {
    return this.payload(key, defaultValue)
  }

  /**
   * Get a value from the request body or return
   * the default value.
   *
   * @example
   * ```ts
   * const name = request.payload('name', 'lenon')
   * ```
   */
  public payload(key: string, defaultValue?: any) {
    return Json.get(this.body, key, defaultValue)
  }

  /**
   * Get only the selected values from the request body.
   *
   * @example
   * ```ts
   * const body = request.only(['name', 'email'])
   * ```
   */
  public only(keys: string[]): any {
    const body = {}

    Object.keys(this.body).forEach(key => {
      if (!keys.includes(key)) {
        return
      }

      body[key] = this.body[key]
    })

    return body
  }

  /**
   * Get all the values from the request body except the
   * selected ones.
   *
   * @example
   * ```ts
   * const body = request.except(['name'])
   * ```
   */
  public except(keys: string[]): any {
    const body = {}

    Object.keys(this.body).forEach(key => {
      if (keys.includes(key)) {
        return
      }

      body[key] = this.body[key]
    })

    return body
  }

  /**
   * Check if the request is multipart.
   */
  public isMultipart() {
    return this.request.isMultipart()
  }

  /**
   * Get the form data from the request.
   */
  public formData(): Promise<FormData> {
    return this.request.formData()
  }

  /**
   * Get the parts from the request.
   */
  public parts(options?: Omit<BusboyConfig, 'headers'>) {
    return this.request.parts(options)
  }

  /**
   * Get the file from the request.
   */
  public file(
    options?: Omit<BusboyConfig, 'headers'> | FastifyMultipartBaseOptions
  ) {
    return this.request.file(options)
  }

  /**
   * Get the files from the request.
   */
  public files(
    options?: Omit<BusboyConfig, 'headers'> | FastifyMultipartBaseOptions
  ) {
    return this.request.files(options)
  }

  /**
   * Save the files from the request.
   */
  public saveRequestFiles(
    options?: Omit<BusboyConfig, 'headers'> & { tmpdir?: string }
  ) {
    return this.request.saveRequestFiles(options)
  }

  /**
   * Clean the files from the request.
   */
  public cleanRequestFiles() {
    return this.request.cleanRequestFiles()
  }

  /**
   * This will get populated as soon as a call to `saveRequestFiles` gets resolved.
   * Avoiding any future duplicate work
   */
  public get savedRequestFiles(): SavedMultipartFile[] | null {
    return this.request.savedRequestFiles
  }

  /**
   * Get the original fastify request.
   */
  public getFastifyRequest(): FastifyRequest {
    return this.request
  }

  /**
   * Add the hostname and port to the url.
   */
  private getHostUrlFor(url: string): string {
    let { address, port } = this.getAddressInfo()

    if (address === '::1') {
      address = '127.0.0.1'
    }

    if (!Is.Ip(address) && address !== 'localhost') {
      return `${this.protocol}://${address}${url}`
    }

    return `${this.protocol}://${address}:${port}${url}`
  }

  /**
   * Get the address info of the server. This method will return the
   * port used to listen the server, the family (IPv4, IPv6) and the
   * server address (127.0.0.1).
   */
  private getAddressInfo(): AddressInfo {
    return this.request.server.server.address() as AddressInfo
  }
}
