/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@athenna/common'
import { Request } from '#src/context/Request'
import { Response } from '#src/context/Response'
import type { RequestHandler } from '#src/types/contexts/Context'
import type { ErrorHandler } from '#src/types/contexts/ErrorContext'
import type { InterceptHandler, TerminateHandler } from '#src/types'
import type { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import { NotFoundException } from '#src/exceptions/NotFoundException'

export class FastifyHandler {
  /**
   * Parse the fastify request handler and the preHandler hook to an Athenna
   * request handler.
   */
  public static request(handler: RequestHandler): RouteHandlerMethod {
    return async (req: FastifyRequest, res: FastifyReply) => {
      if (!req.data) {
        req.data = {}
      }

      const ctx: any = {}

      ctx.data = req.data
      ctx.request = new Request(req)
      ctx.response = new Response(res, ctx.request)

      await handler(ctx)
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
      if (!req.data) {
        req.data = {}
      }

      if (Is.Json(payload)) {
        payload = JSON.parse(payload)
      }

      res.body = payload

      const ctx: any = {}

      ctx.data = req.data
      ctx.request = new Request(req)
      ctx.response = new Response(res, ctx.request)
      ctx.status = ctx.response.statusCode

      payload = await handler(ctx)

      req.body = payload

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
      if (!req.data) {
        req.data = {}
      }

      const ctx: any = {}

      ctx.data = req.data
      ctx.request = new Request(req)
      ctx.response = new Response(res, ctx.request)
      ctx.status = ctx.response.statusCode
      ctx.responseTime = ctx.response.elapsedTime

      await handler(ctx)
    }
  }

  /**
   * Parse the fastify onError hook to an Athenna error handler.
   */
  public static error(handler: ErrorHandler) {
    return async (error: any, req: FastifyRequest, res: FastifyReply) => {
      if (!req.data) {
        req.data = {}
      }

      const ctx: any = {}

      ctx.data = req.data
      ctx.request = new Request(req)
      ctx.response = new Response(res, ctx.request)
      ctx.error = error

      await handler(ctx)
    }
  }

  /**
   * Parse the fastify not found route handler.
   */
  public static notFoundError(handler: ErrorHandler) {
    return async (req: FastifyRequest, res: FastifyReply) => {
      if (!req.data) {
        req.data = {}
      }

      const ctx: any = {}

      ctx.data = req.data
      ctx.request = new Request(req)
      ctx.response = new Response(res, ctx.request)
      ctx.error = new NotFoundException(
        `Route ${req.method}:${req.url} not found`
      )

      await handler(ctx)
    }
  }
}
