/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { Is, Json } from '@athenna/common'
import { Server } from '#src/index'

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
   * Get the request id.
   *
   * @return {string}
   */
  get id() {
    return this.#request.id
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
   * Get the request hostname.
   *
   * @return {string}
   */
  get hostname() {
    return this.#request.hostname
  }

  /**
   * Get the request protocol.
   *
   * @return {"http"|"https"}
   */
  get protocol() {
    return this.#request.protocol
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
   * Get the route url from request.
   *
   * @return {string}
   */
  get routeUrl() {
    return this.#request.routerPath
  }

  /**
   * Get the host url from request.
   *
   * @return {string}
   */
  get hostUrl() {
    const port = Config.get('http.port', Server.getPort())
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
   * Get the server version.
   *
   * @return {string}
   */
  get version() {
    return this.#request.server.version
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
   * Get only the selected values from the request body.
   *
   * @param {string} keys
   * @return {any}
   */
  only(...keys) {
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
   *
   * @param {string[]} keys
   * @return {any}
   */
  except(...keys) {
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
   *
   * @param {string} key
   * @param {string} [defaultValue]
   * @return {any}
   */
  input(key, defaultValue) {
    return this.payload(key, defaultValue)
  }

  /**
   * Get a value from the request body or the default value.
   *
   * @param {string} key
   * @param {string} [defaultValue]
   * @return {any}
   */
  payload(key, defaultValue) {
    return Json.get(this.body, key, defaultValue)
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
