/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { AddressInfo } from 'node:net'
import { FastifyRequest } from 'fastify'
import { Is, Json } from '@athenna/common'

export class Request {
  /**
   * The fastify request object.
   */
  public request: FastifyRequest

  public constructor(request: FastifyRequest) {
    this.request = request
  }

  /**
   * Get the request id.
   *
   * @example 12345
   */
  public get id(): string {
    return this.request.id
  }

  /**
   * Get the request ip.
   *
   * @example 192.168.0.1
   */
  public get ip(): string {
    return this.request.ip
  }

  /**
   * Get the request hostname.
   *
   * @example localhost
   */
  public get hostname(): string {
    return this.request.hostname
  }

  /**
   * Get the request protocol.
   *
   * @example http
   */
  public get protocol(): 'http' | 'https' {
    return this.request.protocol
  }

  /**
   * Get the request method.
   *
   * @example GET
   */
  public get method(): string {
    return this.request.method
  }

  /**
   * Get the base url from request.
   *
   * @example /users/1
   */
  public get baseUrl(): string {
    return this.request.url.split('?')[0]
  }

  /**
   * Get the base url with host and port info from request.
   *
   * @example http://localhost:3030/users/1
   */
  public get baseHostUrl(): string {
    return this.getHostUrlFor(this.baseUrl)
  }

  /**
   * Get the route url from request.
   *
   * @example /users/:id
   */
  public get routeUrl(): string {
    return this.request.routerPath
  }

  /**
   * Get the route url with host and port info from request.
   *
   * @example http://localhost:3030/users/:id
   */
  public get routeHostUrl(): string {
    return this.getHostUrlFor(this.routeUrl)
  }

  /**
   * Get the original url from request.
   *
   * @example /users/1?query=true
   */
  public get originalUrl(): string {
    return this.request.url
  }

  /**
   * Get the original url with host and port info from request.
   *
   * @example /users/1?query=true
   */
  public get originalHostUrl(): string {
    return this.getHostUrlFor(this.originalUrl)
  }

  /**
   * Get all body from request.
   */
  public get body(): any | any[] {
    return this.request.body || {}
  }

  /**
   * Get all params from request.
   */
  public get params(): any {
    return this.request.params || {}
  }

  /**
   * Get all queries from request.
   */
  public get queries(): any {
    return this.request.query || {}
  }

  /**
   * Get all headers from request.
   */
  public get headers(): any {
    return this.request.headers || {}
  }

  /**
   * Get the server port.
   */
  public get port(): number {
    return this.getAddressInfo().port
  }

  /**
   * Get the server version.
   */
  public get version(): string {
    return this.request.server.version
  }

  /**
   * Get a value from the request params or the default value.
   */
  public param(param: string, defaultValue?: any): any {
    return this.params[param] || defaultValue
  }

  /**
   * Get a value from the request query param or the default value.
   */
  public query(query: string, defaultValue?: any): any {
    return this.queries[query] || defaultValue
  }

  /**
   * Get a value from the request header or the default value.
   */
  public header(header: string, defaultValue?: any): any {
    return this.headers[header] || defaultValue
  }

  /**
   * Get only the selected values from the request body.
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
   * Get all the values from the request body except the selected ones.
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
   * Get a value from the request body or the default value.
   */
  public input(key: string, defaultValue?: any): any {
    return this.payload(key, defaultValue)
  }

  /**
   * Get a value from the request body or the default value.
   */
  public payload(key: string, defaultValue?: any) {
    return Json.get(this.body, key, defaultValue)
  }

  /**
   * Add the hostname and port to the url.
   */
  private getHostUrlFor(url: string): string {
    const { address, port } = this.getAddressInfo()

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
