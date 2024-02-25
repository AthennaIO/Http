/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { View } from '@athenna/view'
import type { FastifyReply } from 'fastify'
import type { SendOptions } from '@fastify/static'
import type { Request } from '#src/context/Request'
import type { FastifyHelmetOptions } from '@fastify/helmet'

export class Response {
  /**
   * The fastify response object.
   */
  public response: FastifyReply

  /**
   * The request object from request context.
   */
  public request: Request

  public constructor(response: FastifyReply, request?: Request) {
    this.response = response
    this.request = request
  }

  /**
   * Verify if the response has been already sent.
   */
  public get sent(): boolean {
    return this.response.sent
  }

  /**
   * Get the response body sent in response.
   */
  public get body(): any | any[] {
    return this.response.body
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
    return this.response.elapsedTime
  }

  /**
   * Terminated the request sending a view to be rendered.
   */
  public async view(view: string, data?: any): Promise<Response> {
    const content = await View.render(view, { ...data, request: this.request })

    await this.safeHeader(
      'Content-Type',
      'text/html; charset=utf-8'
    ).response.send(content)

    this.response.body = content

    return this
  }

  /**
   * Terminate the request sending the response body or not.
   */
  public async send(data?: any): Promise<Response> {
    await this.response.send(data)

    this.response.body = data

    return this
  }

  public sendFile(filename: string, filepath?: string): Promise<Response>
  public sendFile(
    filename: string,
    options?: string | SendOptions
  ): Promise<Response>

  public sendFile(
    filename: string,
    filepath?: string,
    options?: SendOptions
  ): Promise<Response>

  /**
   * Terminated the request sending a file.
   */
  public async sendFile(
    filename: string,
    filepath?: string,
    options?: SendOptions
  ): Promise<Response> {
    await this.response.sendFile(filename, filepath, options)

    return this
  }

  public download(filepath: string, filename?: string): Promise<Response>
  public download(
    filepath: string,
    options?: string | SendOptions
  ): Promise<Response>

  public download(
    filename: string,
    filepath?: string,
    options?: SendOptions
  ): Promise<Response>

  public async download(
    filepath: string,
    filename?: string,
    options?: SendOptions
  ): Promise<Response> {
    await this.response.download(filename, filepath, options)

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
   * Add some header safely to the response. This means that the header is not
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
