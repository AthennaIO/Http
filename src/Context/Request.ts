/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@secjs/utils'
import { Env } from '@athenna/config'
import { FastifyRequest } from 'fastify'
import { removeSlash } from '../Utils/removeSlash'
import { RequestContract } from '../Contracts/Context/RequestContract'

export class Request implements RequestContract {
  private request: FastifyRequest

  constructor(request: FastifyRequest) {
    this.request = request
  }

  get ip(): string {
    return this.request.ip
  }

  get method(): string {
    return this.request.method
  }

  get hostUrl(): string {
    const url = this.request.url
    const port = Env('PORT', '1335')
    let host = Env('APP_DOMAIN', `http://localhost:${port}`)

    if (!Is.Ip(host)) host = host.replace(`:${port}`, '')

    return removeSlash(`${host}${url}`) as string
  }

  get baseUrl(): string {
    return this.request.url.split('?')[0]
  }

  get originalUrl(): string {
    return this.request.url
  }

  get body(): Record<string, any> {
    return this.request.body as Record<string, any>
  }

  get params(): Record<string, string> {
    return this.request.params as Record<string, string>
  }

  get queries(): Record<string, string> {
    return this.request.query as Record<string, string>
  }

  get headers(): Record<string, string> {
    return this.request.headers as Record<string, string>
  }

  param(param: string, defaultValue?: string) {
    const params = this.request.params as Record<string, string>

    return params[param] || defaultValue
  }

  query(query: string, defaultValue?: string) {
    const queries = this.request.query as Record<string, string>

    return queries[query] || defaultValue
  }

  header(header: string, defaultValue?: string) {
    const headers = this.request.headers as Record<string, string>

    return headers[header] || defaultValue
  }

  payload(payload: string, defaultValue?: string) {
    const body = this.request.body as Record<string, any>

    return body[payload] || defaultValue
  }
}
