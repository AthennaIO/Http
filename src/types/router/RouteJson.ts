/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HTTPMethods, RouteOptions } from 'fastify'
import type { RequestHandler, MiddlewareRecord } from '#src/types'

export type RouteJson = {
  url: string
  methods?: HTTPMethods[]
  name?: string
  deleted?: boolean
  prefixes?: string[]
  handler?: RequestHandler
  middlewares?: MiddlewareRecord
  fastify?: Partial<RouteOptions>
}
