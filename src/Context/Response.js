/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class Response {
  /**
   * Fastify response object.
   *
   * @type {import('fastify').FastifyReply}
   */
  #response

  /**
   * Create a new instance of Response.
   *
   * @param {import('fastify').FastifyReply} response
   * @return {Response}
   */
  constructor(response) {
    this.#response = response
  }

  /**
   * Terminate the request sending the response body.
   *
   * @param {any} [data]
   * @return {void}
   */
  send(data) {
    this.#response.send(data)
  }

  /**
   * Set the response status code.
   *
   * @param {number} code
   * @return {Response}
   */
  status(code) {
    this.#response.status(code)

    return this
  }

  /**
   * Remove some header from the response.
   *
   * @param {string} header
   * @return {Response}
   */
  removeHeader(header) {
    this.#response.removeHeader(header)

    return this
  }

  /**
   * Add some header to the response.
   *
   * @param {string} header
   * @param {any} value
   * @return {Response}
   */
  header(header, value) {
    this.#response.header(header, value)

    return this
  }

  /**
   * Only add some header to the response if it's not defined yet.
   *
   * @param {string} header
   * @param {any} value
   * @return {Response}
   */
  safeHeader(header, value) {
    if (!this.#response.hasHeader(header)) {
      this.#response.header(header, value)
    }

    return this
  }

  /**
   * Redirect the response to other url with different status code.
   *
   * @param {string} url
   * @param {number} [statusCode]
   * @return {void}
   */
  redirectTo(url, statusCode) {
    if (statusCode) {
      this.#response.redirect(statusCode, url)
    }

    this.#response.redirect(url)
  }

  /**
   * Get the default fastify response object.
   *
   * @return {import('fastify').FastifyReply}
   */
  getFastifyResponse() {
    return this.#response
  }
}
