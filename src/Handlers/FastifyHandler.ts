/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/* eslint-disable @typescript-eslint/no-empty-function */

import { Is } from '@secjs/utils'
import { Request } from '../Context/Request'
import { Response } from '../Context/Response'
import { FastifyReply, FastifyRequest } from 'fastify'
import { HandlerContract } from '../Contracts/Context/HandlerContract'
import { ErrorHandlerContract } from '../Contracts/Context/Error/ErrorHandlerContract'
import { HandleHandlerContract } from '../Contracts/Context/Middlewares/Handle/HandleHandlerContract'
import { InterceptHandlerContract } from '../Contracts/Context/Middlewares/Intercept/InterceptHandlerContract'
import { TerminateHandlerContract } from '../Contracts/Context/Middlewares/Terminate/TerminateHandlerContract'

declare module 'fastify' {
  interface FastifyRequest {
    data: any
  }
}

export class FastifyHandler {
  static createOnSendHandler(handler: InterceptHandlerContract) {
    return async (req: FastifyRequest, res: FastifyReply, payload) => {
      const request = new Request(req)
      const response = new Response(res)

      if (!req.data) req.data = {}
      if (!req.query) req.query = {}
      if (!req.params) req.params = {}

      let body = payload

      if (Is.Json(payload)) {
        body = JSON.parse(body)
      }

      body = await handler({
        request,
        response,
        body,
        status: res.statusCode,
        params: req.params as Record<string, string>,
        queries: req.query as Record<string, string>,
        data: req.data,
      })

      if (Is.Object(body)) body = JSON.stringify(body)

      return body
    }
  }

  static createDoneHandler(handler: HandleHandlerContract) {
    return (req: FastifyRequest, res: FastifyReply, done: any) => {
      const request = new Request(req)
      const response = new Response(res)

      if (!req.data) req.data = {}
      if (!req.query) req.query = {}
      if (!req.params) req.params = {}

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

  static createResponseHandler(handler: TerminateHandlerContract) {
    return (req: FastifyRequest, res: FastifyReply, done) => {
      const request = new Request(req)
      const response = new Response(res)

      if (!req.data) req.data = {}
      if (!req.query) req.query = {}
      if (!req.params) req.params = {}

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

  static createErrorHandler(handler: ErrorHandlerContract) {
    return (error: any, req: FastifyRequest, res: FastifyReply) => {
      const request = new Request(req)
      const response = new Response(res)

      if (!req.data) req.data = {}
      if (!req.query) req.query = {}
      if (!req.params) req.params = {}

      return handler({
        request,
        response,
        params: req.params as Record<string, string>,
        queries: req.query as Record<string, string>,
        data: req.data,
        error,
      })
    }
  }

  static createRequestHandler(handler: HandlerContract) {
    return async (req: FastifyRequest, res: FastifyReply) => {
      const request = new Request(req)
      const response = new Response(res)

      if (!req.data) req.data = {}
      if (!req.query) req.query = {}
      if (!req.params) req.params = {}

      return handler({
        request,
        response,
        params: req.params as Record<string, string>,
        queries: req.query as Record<string, string>,
        data: req.data,
      })
    }
  }
}
