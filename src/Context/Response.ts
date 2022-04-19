/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { FastifyReply } from 'fastify'
import { ResponseContract } from 'src/Contracts/Context/ResponseContract'

export class Response implements ResponseContract {
  private readonly response: FastifyReply

  /**
   * Create a new instance of Response.
   *
   * @return Response
   */
  public constructor(response: FastifyReply) {
    this.response = response
  }

  /**
   * Terminate the request sending the response body.
   *
   * @param data
   * @return void
   */
  send(data?: any) {
    this.response.send(data)
  }

  /**
   * Terminate the request sending the response body.
   *
   * @param data
   * @return void
   */
  json(data?: any) {
    this.response.send(this.response.serialize(data))
  }

  /**
   * Set the response status code.
   *
   * @param code
   * @return Response
   */
  status(code: number) {
    this.response.status(code)

    return this
  }

  /**
   * Remove some header from the response.
   *
   * @param header
   * @return Response
   */
  removeHeader(header: string) {
    this.response.removeHeader(header)

    return this
  }

  /**
   * Add some header to the response.
   *
   * @param header
   * @param value
   * @return Response
   */
  header(header: string, value: any) {
    this.response.header(header, value)

    return this
  }

  /**
   * Only add some header to the response if it's not defined yet.
   *
   * @param header
   * @param value
   * @return Response
   */
  safeHeader(header: string, value: any) {
    if (!this.response.hasHeader(header)) {
      this.response.header(header, value)
    }

    return this
  }

  /**
   * Redirect the response to other url with different status code.
   *
   * @param url
   * @param statusCode
   * @return void
   */
  redirectTo(url: string, statusCode?: number): void {
    if (statusCode) {
      this.response.redirect(statusCode, url)
    }

    this.response.redirect(url)
  }

  /**
   * Get the default fastify response object.
   *
   * @return FastifyReply
   */
  getFastifyResponse(): FastifyReply {
    return this.response
  }
}
