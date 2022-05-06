/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@secjs/utils'
import { Request } from '#src/Context/Request'
import { Response } from '#src/Context/Response'

export class FastifyHandler {
  /**
   * Creates a new onSend fastify hook.
   *
   * @param {any} handler
   * @return {any}
   */
  static createOnSendHandler(handler) {
    return async (req, res, payload) => {
      const request = new Request(req)
      const response = new Response(res)

      if (!req.data) req.data = {}

      let body = payload

      if (Is.Json(payload)) {
        body = JSON.parse(body)
      }

      body = await handler({
        request,
        response,
        body,
        status: res.statusCode,
        params: req.params,
        queries: req.query,
        data: req.data,
      })

      if (Is.Object(body)) body = JSON.stringify(body)

      return body
    }
  }

  /**
   * Creates a new done fastify hook.
   *
   * @param {any} handler
   * @return {any}
   */
  static createDoneHandler(handler) {
    return (req, res, done) => {
      const request = new Request(req)
      const response = new Response(res)

      if (!req.data) req.data = {}

      return handler({
        request,
        response,
        params: req.params,
        queries: req.query,
        data: req.data,
        next: done,
      })
    }
  }

  /**
   * Creates a new onResponse fastify hook.
   *
   * @param {any} handler
   * @return {any}
   */
  static createOnResponseHandler(handler) {
    return (req, res, done) => {
      const request = new Request(req)
      const response = new Response(res)

      if (!req.data) req.data = {}

      return handler({
        request,
        response,
        params: req.params,
        queries: req.query,
        data: req.data,
        body: req.body,
        headers: res.getHeaders(),
        status: res.statusCode,
        responseTime: res.getResponseTime(),
        next: done,
      })
    }
  }

  /**
   * Creates a new error fastify hook.
   *
   * @param {any} handler
   * @return {any}
   */
  static createErrorHandler(handler) {
    return (error, req, res) => {
      const request = new Request(req)
      const response = new Response(res)

      if (!req.data) req.data = {}

      return handler({
        request,
        response,
        params: req.params,
        queries: req.query,
        data: req.data,
        error,
      })
    }
  }

  /**
   * Creates a new request fastify hook.
   *
   * @param {any} handler
   * @return {any}
   */
  static createRequestHandler(handler) {
    return async (req, res) => {
      const request = new Request(req)
      const response = new Response(res)

      if (!req.data) req.data = {}

      return handler({
        request,
        response,
        params: req.params,
        queries: req.query,
        data: req.data,
      })
    }
  }
}
