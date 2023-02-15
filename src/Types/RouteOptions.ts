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
import { TerminateHandler } from './Contexts/TerminateContext.js'
import { InterceptHandler } from './Contexts/InterceptContext.js'

export type RouteOptions = {
  url: string
  methods: HTTPMethods[]
  handler: RequestHandler
  handlers?: RequestHandler[]
  terminators?: TerminateHandler[]
  interceptors?: InterceptHandler[]
  fastifyOptions?: RouteOptions
}
