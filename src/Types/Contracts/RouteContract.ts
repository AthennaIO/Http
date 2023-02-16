/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  HandleHandler,
  TerminateHandler,
  InterceptHandler,
} from '#src/Types/Middlewares/MiddlewareHandler'

import { FastifySchema } from 'fastify'
import { RouteJSON } from '#src/Types/Router/RouteJSON'
import { MiddlewareTypes } from '#src/Types/Middlewares/MiddlewareTypes'
import { AthennaMiddleware } from '#src/Types/Middlewares/AthennaMiddleware'

export interface RouteContract {
  /**
   * A unique name to lookup the route
   */
  name: string

  /**
   * Sets if route should be registered or not.
   */
  deleted: boolean

  /**
   * Set a prefix for the route.
   *
   * @example
   * ```ts
   * Route.prefix('/api/v1')
   * ```
   */
  prefix(prefix: string): RouteContract

  /**
   * Set a middleware class or named middleware in route.
   *
   * @example
   * ```ts
   * Route.middleware('my-middleware')
   * ```
   * Or
   * ```ts
   * Route.middleware(MyMiddleware)
   * ```
   */
  middleware(
    middleware: string | AthennaMiddleware,
    type?: MiddlewareTypes,
    prepend?: boolean,
  ): RouteContract

  /**
   * Set a handle middleware in route.
   *
   * @example
   * ```ts
   * Route.middleware(ctx => {}, 'handle')
   * ```
   */
  middleware(
    middleware: HandleHandler,
    type: 'handle',
    prepend?: boolean,
  ): RouteContract

  /**
   * Set a intercept middleware in route.
   *
   * @example
   * ```ts
   * Route.middleware(ctx => {
   *  return ctx.body
   * }, 'intercept')
   * ```
   */
  middleware(
    middleware: InterceptHandler,
    type: 'intercept',
    prepend?: boolean,
  ): RouteContract

  /**
   * Set a terminate middleware in route.
   *
   * @example
   * ```ts
   * Route.middleware(ctx => {}, 'terminate')
   * ```
   */
  middleware(
    middleware: TerminateHandler,
    type: 'terminate',
    prepend?: boolean,
  ): RouteContract

  /**
   * Set up all helmet options for route.
   *
   * @example
   * ```ts
   * Route.helmet({
   *  dnsPrefetchControl: { allow: true }
   * })
   * ```
   */
  helmet(
    options: Omit<import('@fastify/helmet').FastifyHelmetOptions, 'global'>,
  ): RouteContract

  /**
   * Set up all schema options for route.
   *
   * @example
   * ```ts
   * Route.schema({
   *  body: {
   *    type: 'array',
   *    items: {
   *      oneOf: [{ type: 'string', description: 'User name' }]
   *    }
   *  }
   * })
   * ```
   */
  schema(options: FastifySchema): RouteContract

  /**
   * Set up all rate limit options for route.
   *
   * @example
   * ```ts
   * Route.rateLimit({
   *  max: 3,
   *  timeWindow: '1 minute'
   * })
   * ```
   */
  rateLimit(
    options: import('@fastify/rate-limit').RateLimitOptions,
  ): RouteContract

  /**
   * Hide the route in swagger docs.
   *
   * @example
   * ```ts
   * Route.hide()
   * ```
   */
  hide(): RouteContract

  /**
   * Set the route as deprecated in swagger docs.
   *
   * @example
   * ```ts
   * Route.deprecated()
   * ```
   */
  deprecated(): RouteContract

  /**
   * Set a summary for the route swagger docs.
   *
   * @example
   * ```ts
   * Route.summary('List all users')
   * ```
   */
  summary(summary: string): RouteContract

  /**
   * Set a description for the route swagger docs.
   *
   * @example
   * ```ts
   * Route.description('List all users')
   * ```
   */
  description(description: string): RouteContract

  /**
   * Set tags for the route swagger docs.
   *
   * @example
   * ```ts
   * Route.tags(['v1'])
   * ```
   */
  tags(tags: string[]): RouteContract

  /**
   * Set body param for the route swagger docs.
   *
   * @example
   * ```ts
   * Route.body('name', {
   *  type: 'string',
   *  description: 'User name'
   * })
   * ```
   */
  body(name: string, body: any): RouteContract

  /**
   * Set param for the route swagger docs.
   *
   * @example
   * ```ts
   * Route.param('id', { description: 'Set the user id' })
   * ```
   */
  param(name: string, param: any): RouteContract

  /**
   * Set query string for the route swagger docs.
   *
   * @example
   * ```ts
   * Route.queryString('page', { description: 'Set the pagination page' })
   * ```
   */
  queryString(name: string, queryString: any): RouteContract

  /**
   * Set response for the route swagger docs.
   *
   * @example
   * For objects
   * ```ts
   * Route.response(200, {
   *  description: 'Return one user',
   *  properties: {
   *    name: { type: 'string', description: 'User name' }
   *  }
   * })
   * ```
   *
   * For arrays
   * ```ts
   * Route.response(200, {
   *  description: 'Return users paginated',
   *  schema: {
   *    type: 'array'
   *    oneOf: [
   *      { type: 'string', description: 'User name' }
   *    ]
   *  }
   * })
   * ```
   */
  response(statusCode: number, response: any): RouteContract

  /**
   * Set the route security in swagger docs.
   *
   * @example
   * ```ts
   * Route.security('apiToken', [])
   * ```
   */
  security(key: string, values: string[]): RouteContract

  /**
   * Set the external documentation url in swagger docs.
   *
   * @example
   * ```ts
   * Route.externalDocs('https://github.com/athennaio/docs', 'Athenna Framework Documentation')
   * ```
   */
  externalDocs(url: string, description?: string): RouteContract

  /**
   * Set the type of the content that the API consumes in swagger docs.
   *
   * @example
   * ```ts
   * Route.consumes(['json', 'yaml', ...])
   * ```
   */
  consumes(consumes: string[]): RouteContract

  /**
   * Set the type of the content that the API produces in swagger docs.
   *
   * @example
   * ```ts
   * Route.produces(['json', 'yaml', ...])
   * ```
   */
  produces(produces: string[]): RouteContract

  /**
   * Get the route as JSON.
   *
   * @example
   * ```ts
   * Route.toJSON()
   * ```
   */
  toJSON(): RouteJSON
}
