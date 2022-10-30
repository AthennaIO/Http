/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@athenna/common'
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

      const isJson = Is.Json(payload)

      if (isJson) {
        payload = JSON.parse(payload)
      }

      payload = await handler({
        request,
        response,
        body: payload,
        status: res.statusCode,
        params: req.params,
        queries: req.query,
        data: req.data,
      })

      if (isJson) {
        payload = JSON.stringify(payload)
      }

      return payload
    }
  }

  /**
   * Creates a new done fastify hook.
   *
   * @param {any} handler
   * @return {any}
   */
  static createDoneHandler(handler) {
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

  /**
   * Creates a new onResponse fastify hook.
   *
   * @param {any} handler
   * @return {any}
   */
  static createOnResponseHandler(handler) {
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
        body: req.body,
        headers: res.getHeaders(),
        status: res.statusCode,
        responseTime: res.getResponseTime(),
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
    return async (error, req, res) => {
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
