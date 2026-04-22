/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { Is, Module } from '@athenna/common'
import { Request } from '#src/context/Request'
import { Response } from '#src/context/Response'
import type { Context as OtelContext } from '@opentelemetry/api'
import type { RequestHandler } from '#src/types/contexts/Context'
import type { ErrorHandler } from '#src/types/contexts/ErrorContext'
import type { InterceptHandler, TerminateHandler } from '#src/types'
import { NotFoundException } from '#src/exceptions/NotFoundException'
import type { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'

const otelApi = await Module.safeImport('@opentelemetry/api')
const otelCurrentContextBagKey = Symbol.for('athenna.otel.currentContextBag')

export class FastifyHandler {
  /**
   * Parse the fastify request handler and the preHandler hook to an Athenna
   * request handler.
   */
  public static request(handler: RequestHandler): RouteHandlerMethod {
    return async (req: FastifyRequest, res: FastifyReply) => {
      const ctx = this.createContext(req, res)

      await this.runWithOtelContext(req, ctx, () => handler(ctx))
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
      if (Is.Json(payload)) {
        payload = JSON.parse(payload)
      }

      res.body = payload

      const ctx = this.createContext(req, res, { status: res.statusCode })

      payload = await this.runWithOtelContext(req, ctx, () => handler(ctx))

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
      const ctx = this.createContext(req, res, {
        status: res.statusCode,
        responseTime: res.elapsedTime
      })

      await this.runWithOtelContext(req, ctx, () => handler(ctx))
    }
  }

  /**
   * Parse the fastify onError hook to an Athenna error handler.
   */
  public static error(handler: ErrorHandler) {
    return async (error: any, req: FastifyRequest, res: FastifyReply) => {
      const ctx = this.createContext(req, res, { error })

      await this.runWithOtelContext(req, ctx, () => handler(ctx))
    }
  }

  /**
   * Parse the fastify not found route handler.
   */
  public static notFoundError(handler: ErrorHandler) {
    return async (req: FastifyRequest, res: FastifyReply) => {
      const ctx = this.createContext(req, res, {
        error: new NotFoundException(`Route ${req.method}:${req.url} not found`)
      })

      await this.runWithOtelContext(req, ctx, () => handler(ctx))
    }
  }

  private static createContext(
    req: FastifyRequest,
    res: FastifyReply,
    extra = {}
  ) {
    if (!req.data) {
      req.data = {}
    }

    const request = new Request(req)

    return {
      data: req.data,
      request,
      response: new Response(res, request),
      ...extra
    } as any
  }

  private static isOtelContextEnabled() {
    return Config.is('http.otel.contextEnabled', true)
  }

  private static getOrCreateOtelContext(req: FastifyRequest, ctx: any) {
    if (req.otelContext) {
      return req.otelContext as OtelContext
    }

    let otelContext = otelApi.context.active()
    const bag = new Map<string | symbol, unknown>()

    for (const binding of Config.get('http.otel.contextBindings', [])) {
      const value = binding.resolve(ctx)

      if (Is.Undefined(value) && !binding.includeIfUndefined) {
        continue
      }

      bag.set(binding.key, value)
      otelContext = otelContext.setValue(binding.key, value)
    }

    req.data.otelCurrentContextBag = bag
    otelContext = otelContext.setValue(otelCurrentContextBagKey as any, bag)
    req.otelContext = otelContext

    return otelContext as OtelContext
  }

  private static runWithOtelContext(
    req: FastifyRequest,
    ctx: any,
    callback: () => any
  ) {
    if (!this.isOtelContextEnabled() || !otelApi) {
      return callback()
    }

    return otelApi.context.with(this.getOrCreateOtelContext(req, ctx), callback)
  }
}
