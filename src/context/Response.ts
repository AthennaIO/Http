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
import type { FastifyHelmetOptions } from '@fastify/helmet'

export class Response {
  /**
   * The fastify response object.
   */
  private response: FastifyReply

  /**
   * The request object from request context.
   */
  private request: Request

  public constructor(response: FastifyReply, request?: Request) {
    this.response = response
    this.request = request
  }

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
  public get sent(): boolean {
    return this.response.sent
  }

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
  public get body(): any | any[] {
    return this.response.body
  }

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
  public get statusCode(): number {
    return this.response.statusCode
  }

  /**
   * Get the headers set in the response.
   *
   * @example
   * ```ts
   * const headers = response.headers
   * ```
   */
  public get headers(): any {
    return this.response.getHeaders()
  }

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
  public get responseTime(): number {
    return this.response.elapsedTime
  }

  /**
   * Terminate the request sending a view to be rendered.
   *
   * @example
   * ```ts
   * return response.view('welcome', { name: 'lenon' })
   * ```
   */
  public async view(view: string, data?: any): Promise<Response> {
    const content = await View.edge
      .createRenderer()
      .share({ request: this.request })
      .render(view, data)

    await this.safeHeader('Content-Type', 'text/html; charset=utf-8').send(
      content
    )

    this.response.body = content

    return this
  }

  /**
   * Terminate the request sending the response body or not.
   *
   * @example
   * ```ts
   * return response.send({ name: 'lenon' })
   * ```
   */
  public async send(data?: any): Promise<Response> {
    await this.response.send(data)

    this.response.body = data

    return this
  }

  /**
   * @example
   * ```ts
   * return response.sendFile('img.png')
   * ```
   */
  public sendFile(filename: string, filepath?: string): Promise<Response>

  /**
   * @example
   * ```ts
   * return response.sendFile('img.png', { cacheControl: false })
   * ```
   */
  public sendFile(
    filename: string,
    options?: string | SendOptions
  ): Promise<Response>

  /**
   * @example
   * ```ts
   * return response.sendFile('img.png', Path.tmp(), {
   *  cacheControl: false
   * })
   * ```
   */
  public async sendFile(
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
  public async sendFile(
    filename: string,
    filepath?: string,
    options?: SendOptions
  ): Promise<Response> {
    await this.response.sendFile(filename, filepath, options)

    return this
  }

  /**
   * @example
   * ```ts
   * return response.download('img.png', 'custom-img.png')
   * ```
   */
  public download(filepath: string, filename: string): Promise<Response>

  /**
   * @example
   * ```ts
   * return response.download('img.png', 'custom-img.png', {
   *  cacheControl: false
   * })
   * ```
   */
  public async download(
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
  public async download(
    filepath: string,
    filename: string,
    options?: SendOptions
  ): Promise<Response> {
    await this.response.download(filename, filepath, options)

    return this
  }

  /**
   * Set the response status code.
   *
   * @example
   * ```ts
   * return response.status(200).send()
   * ```
   */
  public status(code: number): Response {
    this.response.status(code)

    return this
  }

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
  public header(header: string, value: any): Response {
    this.response.header(header, value)

    return this
  }

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
  public hasHeader(header: string): boolean {
    return this.response.hasHeader(header)
  }

  /**
   * Add some header safely to the response. This means that
   * the header is not going to be added if is already set.
   *
   * @example
   * ```ts
   * response.safeHeader('content-type', 'application/json')
   * ```
   */
  public safeHeader(header: string, value: any): Response {
    this.response.header(header, value)

    return this
  }

  /**
   * Remove some header from the response.
   *
   * @example
   * ```ts
   * response.removeHeader('content-type')
   * ```
   */
  public removeHeader(header: string): Response {
    this.response.removeHeader(header)

    return this
  }

  /**
   * Redirect the response to other url. You can also set a
   * different status code for the redirect.
   *
   * @example
   * ```ts
   * return response.redirect('users', 304)
   * ```
   */
  public async redirectTo(url: string, status?: number): Promise<Response> {
    if (status) {
      await this.response.redirect(url, status)

      return this
    }

    await this.response.redirect(url)

    return this
  }

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
  public helmet(options: FastifyHelmetOptions): Response {
    this.response.helmet(options)

    return this
  }

  /**
   * Get the original fastify response.
   */
  public getFastifyResponse(): FastifyReply {
    return this.response
  }
}
