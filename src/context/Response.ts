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
import type { Request, Response } from '#src/types'
import type { FastifyHelmetOptions } from '@fastify/helmet'

/**
 * Create the Athenna response object
 */
export function response(reply: FastifyReply, request?: Request): Response {
  const response = {
    response: reply,
    request,
    get sent() {
      return reply.sent
    },
    get body() {
      return reply.body
    },
    get statusCode() {
      return reply.statusCode
    },
    get headers() {
      return reply.getHeaders()
    },
    get responseTime() {
      return reply.elapsedTime
    },
    async view(view: string, data?: any) {
      const content = await View.render(view, {
        ...data,
        request: this.request
      })

      await response
        .safeHeader('Content-Type', 'text/html; charset=utf-8')
        .response.send(content)

      response.response.body = content

      return response
    },
    async send(data?: any) {
      await response.response.send(data)

      response.response.body = data

      return response
    },
    async sendFile(filename: string, filepath?: string, options?: SendOptions) {
      await response.response.sendFile(filename, filepath, options)

      return response
    },
    async download(filepath: string, filename: string, options?: SendOptions) {
      await response.response.download(filename, filepath, options)

      return response
    },
    status(code: number) {
      response.response.status(code)

      return response
    },
    header(header: string, value: any) {
      response.response.header(header, value)

      return response
    },
    hasHeader(header: string): boolean {
      return response.response.hasHeader(header)
    },
    safeHeader(header: string, value: any) {
      response.response.header(header, value)

      return response
    },
    removeHeader(header: string) {
      response.response.removeHeader(header)

      return response
    },
    async redirectTo(url: string, status?: number) {
      if (status) {
        await this.response.redirect(status, url)

        return response
      }

      await this.response.redirect(url)

      return response
    },
    helmet(options: FastifyHelmetOptions) {
      this.response.helmet(options)

      return response
    }
  }

  return response
}
