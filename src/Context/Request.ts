/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@secjs/utils'
import { Config } from '@athenna/config'
import { FastifyRequest } from 'fastify'
import { removeSlash } from 'src/Utils/removeSlash'
import { RequestContract } from 'src/Contracts/Context/RequestContract'

export class Request implements RequestContract {
  private readonly request: FastifyRequest

  /**
   * Create a new instance of Request.
   *
   * @return Request
   */
  public constructor(request: FastifyRequest) {
    this.request = request
  }

  /**
   * Get the request ip.
   *
   * @return string
   */
  get ip(): string {
    return this.request.ip
  }

  /**
   * Get the request method.
   *
   * @return string
   */
  get method(): string {
    return this.request.method
  }

  /**
   * Get the host url from request.
   *
   * @return string
   */
  get hostUrl(): string {
    const url = this.request.url
    const port = Config.get('http.port', 1335)
    let host = Config.get('http.domain', `http://localhost:${port}`) as string

    if (!Is.Ip(host) && !host.includes('localhost')) {
      host = host.replace(`:${port}`, '')
    }

    return removeSlash(`${host}${url}`) as string
  }

  /**
   * Get the base request url.
   *
   * @return string
   */
  get baseUrl(): string {
    return this.request.url.split('?')[0]
  }

  /**
   * Get the original request url.
   *
   * @return string
   */
  get originalUrl(): string {
    return this.request.url
  }

  /**
   * Get all body from request.
   *
   * @return any
   */
  get body(): any {
    return this.request.body
  }

  /**
   * Get all params from request.
   *
   * @return any
   */
  get params(): any {
    return this.request.params
  }

  /**
   * Get all queries from request.
   *
   * @return any
   */
  get queries(): any {
    return this.request.query
  }

  /**
   * Get all headers from request.
   *
   * @return any
   */
  get headers(): any {
    return this.request.headers
  }

  /**
   * Get a value from the request params or the default value.
   *
   * @return any
   */
  param(param: string, defaultValue?: string): any {
    const params = this.request.params as any

    return params[param] || defaultValue
  }

  /**
   * Get a value from the request query param or the default value.
   *
   * @return any
   */
  query(query: string, defaultValue?: string): any {
    const queries = this.request.query as any

    return queries[query] || defaultValue
  }

  /**
   * Get a value from the request header or the default value.
   *
   * @return any
   */
  header(header: string, defaultValue?: string): any {
    const headers = this.request.headers as any

    return headers[header] || defaultValue
  }

  /**
   * Get a value from the request body or the default value.
   *
   * @return any
   */
  payload(payload: string, defaultValue?: string): any {
    const body = this.request.body as Record<string, any>

    return body[payload] || defaultValue
  }

  /**
   * Get the default fastify request object.
   *
   * @return FastifyRequest
   */
  getFastifyRequest(): FastifyRequest {
    return this.request
  }
}
