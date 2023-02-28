/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { FastifyReply } from 'fastify'
import { FastifyHelmetOptions } from '@fastify/helmet'

export class Response {
  /**
   * The fastify response object.
   */
  public response: FastifyReply

  public constructor(response: FastifyReply) {
    this.response = response
  }

  /**
   * Verify if the response has been already sent.
   */
  public get sent(): boolean {
    return this.response.sent
  }

  /**
   * Get the status code sent in response.
   */
  public get statusCode(): number {
    return this.response.statusCode
  }

  /**
   * Get the headers sent in response.
   */
  public get headers(): any {
    return this.response.getHeaders()
  }

  /**
   * Get the time in MS of how much the request has taken to response.
   */
  public get responseTime(): number {
    return this.response.getResponseTime()
  }

  /**
   * Terminate the request sending the response body or not.
   */
  public async send(data?: any): Promise<Response> {
    await this.response.send(data)

    return this
  }

  /**
   * Set the response status code.
   */
  public status(code: number): Response {
    this.response.status(code)

    return this
  }

  /**
   * Add some header to the response.
   */
  public header(header: string, value: any): Response {
    this.response.header(header, value)

    return this
  }

  /**
   * Verify if response has some header.
   */
  public hasHeader(header: string): boolean {
    return this.response.hasHeader(header)
  }

  /**
   * Add some header safelly to the response. This means that the header is not
   * going to be added if is already set.
   */
  public safeHeader(header: string, value: any): Response {
    this.response.header(header, value)

    return this
  }

  /**
   * Remove some header from the response.
   */
  public removeHeader(header: string): Response {
    this.response.removeHeader(header)

    return this
  }

  /**
   * Redirect the response to other url. You can also set a different status code
   * for the redirect.
   */
  public async redirectTo(url: string, status?: number): Promise<Response> {
    if (status) {
      await this.response.redirect(status, url)

      return this
    }

    await this.response.redirect(url)

    return this
  }

  /**
   * Apply helmet in response.
   */
  public helmet(options: FastifyHelmetOptions): Response {
    this.response.helmet(options)

    return this
  }
}
