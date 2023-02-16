/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HTTPMethods } from 'fastify'
import { RequestHandler } from '#src/Types/Contexts/Context'
import { MiddlewareRecord } from '#src/Types/Middlewares/MiddlewareHandler'

export type RouteJSON = {
  url: string
  methods: HTTPMethods[]
  handler: RequestHandler
  middlewares: MiddlewareRecord
  fastifyOptions?: any
}
