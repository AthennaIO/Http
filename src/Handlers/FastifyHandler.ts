/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  InterceptHandler,
  TerminateHandler,
} from '#src/Types/Middlewares/MiddlewareHandler'

import { Is } from '@athenna/common'
import { Request } from '#src/Context/Request'
import { Response } from '#src/Context/Response'
import { RequestHandler } from '#src/Types/Contexts/Context'
import { ErrorHandler } from '#src/Types/Contexts/ErrorContext'
import { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'

export class FastifyHandler {
  /**
   * Parse the fastify request handler and the preHandler hook to an Athenna
   * request handler.
   */
  public static request(handler: RequestHandler): RouteHandlerMethod {
    return async (req: FastifyRequest, res: FastifyReply) => {
      const request = new Request(req)
      const response = new Response(res)

      if (!req.data) {
        req.data = {}
      }

      await handler({
        request,
        response,
        data: req.data,
        body: req.body,
        params: req.params,
        queries: req.query,
        headers: req.headers,
      })
    }
  }

  /**
   * Just and alises for the request handler.
   */
  public static handle(handler: RequestHandler) {
    return this.request(handler)
  }

  /**
   * Parse the fastify onSend hook to an Athenna intercept handler.
   */
  public static intercept(handler: InterceptHandler) {
    return async (req: FastifyRequest, res: FastifyReply, payload: any) => {
      const request = new Request(req)
      const response = new Response(res)

      if (Is.Json(payload)) {
        payload = JSON.parse(payload)
      }

      res.body = payload

      payload = await handler({
        request,
        response,
        status: response.statusCode,
        data: req.data,
        body: res.body,
        params: req.params,
        queries: req.query,
        headers: req.headers,
      })

      res.body = payload

      if (Is.Object(payload)) {
        payload = JSON.stringify(payload)
      }

      return payload
    }
  }

  /**
   * Parse the fastify onResponse hook to an Athenna terminate handler.
   */
  public static terminate(handler: TerminateHandler) {
    return async (req: FastifyRequest, res: FastifyReply) => {
      const request = new Request(req)
      const response = new Response(res)

      await handler({
        request,
        response,
        params: req.params,
        queries: req.query,
        data: req.data,
        body: res.body || req.body,
        headers: res.getHeaders(),
        status: res.statusCode,
        responseTime: res.getResponseTime(),
      })
    }
  }

  /**
   * Parse the fastify onError hook to an Athenna error handler.
   */
  public static error(handler: ErrorHandler) {
    return async (error: any, req: FastifyRequest, res: FastifyReply) => {
      const request = new Request(req)
      const response = new Response(res)

      await handler({
        request,
        response,
        data: req.data,
        body: res.body || req.body,
        params: req.params,
        queries: req.query,
        headers: req.headers,
        error,
      })
    }
  }
}
