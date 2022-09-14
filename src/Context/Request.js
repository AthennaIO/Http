/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config, Is } from '@secjs/utils'

export class Request {
  /**
   * Fastify request object.
   *
   * @type {import('fastify').FastifyRequest}
   */
  #request

  /**
   * Create a new instance of Request.
   *
   * @param {import('fastify').FastifyRequest} request
   * @return {Request}
   */
  constructor(request) {
    this.#request = request
  }

  /**
   * Get the request ip.
   *
   * @return {string}
   */
  get ip() {
    return this.#request.ip
  }

  /**
   * Get the request method.
   *
   * @return {string}
   */
  get method() {
    return this.#request.method
  }

  /**
   * Get the host url from request.
   *
   * @return {string}
   */
  get hostUrl() {
    const port = Config.get('http.port', 1335)
    let host = Config.get('http.domain', `http://localhost:${port}`)

    if (!Is.Ip(host) && !host.includes('localhost')) {
      host = host.replace(`:${port}`, '')
    }

    return host.concat(this.originalUrl)
  }

  /**
   * Get the base request url.
   *
   * @return {string}
   */
  get baseUrl() {
    return this.#request.url.split('?')[0]
  }

  /**
   * Get the original request url.
   *
   * @return {string}
   */
  get originalUrl() {
    return this.#request.url
  }

  /**
   * Get all body from request.
   *
   * @return {any}
   */
  get body() {
    return this.#request.body || {}
  }

  /**
   * Get all params from request.
   *
   * @return {any}
   */
  get params() {
    return this.#request.params || {}
  }

  /**
   * Get all queries from request.
   *
   * @return {any}
   */
  get queries() {
    return this.#request.query || {}
  }

  /**
   * Get all headers from request.
   *
   * @return {any}
   */
  get headers() {
    return this.#request.headers || {}
  }

  /**
   * Get a value from the request params or the default value.
   *
   * @param {string} param
   * @param {string} [defaultValue]
   * @return {any}
   */
  param(param, defaultValue) {
    return this.params[param] || defaultValue
  }

  /**
   * Get a value from the request query param or the default value.
   *
   * @param {string} query
   * @param {string} [defaultValue]
   * @return {any}
   */
  query(query, defaultValue) {
    return this.queries[query] || defaultValue
  }

  /**
   * Get a value from the request header or the default value.
   *
   * @param {string} header
   * @param {string} [defaultValue]
   * @return {any}
   */
  header(header, defaultValue) {
    return this.headers[header] || defaultValue
  }

  /**
   * Get a value from the request body or the default value.
   *
   * @param {string} payload
   * @param {string} [defaultValue]
   * @return {any}
   */
  payload(payload, defaultValue) {
    return this.body[payload] || defaultValue
  }

  /**
   * Get the default fastify request object.
   *
   * @return {import('fastify').FastifyRequest}
   */
  getFastifyRequest() {
    return this.#request
  }
}
