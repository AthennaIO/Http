/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { FastifyReply } from 'fastify'
import { ResponseContract } from '../Contracts/Context/ResponseContract'

export class Response implements ResponseContract {
  private response: FastifyReply

  constructor(response: FastifyReply) {
    this.response = response
  }

  send(data?: Record<string, any>) {
    this.response.send(data)
  }

  json(data?: Record<string, any>) {
    this.response.serialize(data)
  }

  status(code: number) {
    this.response.status(code)

    return this
  }

  removeHeader(header: string) {
    this.response.removeHeader(header)

    return this
  }

  header(header: string, value: any) {
    this.response.header(header, value)

    return this
  }

  safeHeader(header: string, value: any) {
    if (!this.response.hasHeader(header)) {
      this.response.header(header, value)
    }

    return this
  }

  redirectTo(url: string, statusCode?: number): this {
    if (statusCode) {
      this.response.redirect(statusCode, url)

      return this
    }

    this.response.redirect(url)

    return this
  }
}
