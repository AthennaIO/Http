/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HTTPMethods } from 'fastify'
import { Route } from '#src/Router/Route'
import { Is, String } from '@athenna/common'
import { MiddlewareTypes } from '#src/Types/Middlewares/MiddlewareTypes'
import { MiddlewareHandlerExt } from '#src/Types/Middlewares/MiddlewareHandler'

export class RouteResource {
  /**
   * All routes registered in the resource.
   */
  public routes: Route[] = []

  /**
   * The routes indexes in the resource.
   */
  public indexes = {
    index: 0,
    store: 1,
    show: 2,
    update: 3,
    delete: 4,
  }

  /**
   * The resource name.
   */
  public resource: string

  /**
   * The resource controller.
   */
  public controller: any

  public constructor(resource: string, controller: any) {
    this.resource = resource
    this.controller = controller

    this.buildRoutes()
  }

  /**
   * Set a middleware for the route resource.
   *
   * @example
   * ```ts
   * Route.resource('/test', 'TestController').middleware('auth')
   * ```
   */
  public middleware(
    middleware: MiddlewareHandlerExt,
    type: MiddlewareTypes = 'handle',
  ): RouteResource {
    this.routes.forEach(route => route.middleware(middleware, type))

    return this
  }

  /**
   * Register only the methods in the array.
   *
   * @example
   * ```ts
   * Route.resource('/test', 'TestController').only(['index'])
   * ```
   */
  public only(names: string[]): RouteResource {
    this.routes.forEach(route => (route.deleted = true))

    names.forEach(name => (this.routes[this.indexes[name]].deleted = false))

    return this
  }

  /**
   * Register all methods except the methods in the array.
   *
   * @example
   * ```ts
   * Route.resource('/test', 'TestController').except(['index'])
   * ```
   */
  public except(names: string[]): RouteResource {
    names.forEach(name => (this.routes[this.indexes[name]].deleted = true))

    return this
  }

  /**
   * Set up helmet options for route resource.
   *
   *@example
   * ```ts
   * Route.helmet({
   *  dnsPrefetchControl: { allow: true }
   * })
   * ```
   */
  public helmet(
    options: Omit<import('@fastify/helmet').FastifyHelmetOptions, 'global'>,
  ): RouteResource {
    this.routes.forEach(route => route.helmet(options))

    return this
  }

  /**
   * Set up rate limit options for route resource method.
   *
   * @example
   * ```ts
   * Route.rateLimit({
   *  max: 3,
   *  timeWindow: '1 minute'
   * })
   * ```
   */
  public rateLimit(
    options: import('@fastify/rate-limit').RateLimitOptions,
  ): RouteResource {
    this.routes.forEach(route => route.rateLimit(options))

    return this
  }

  /**
   * Create the route.
   */
  private makeRoute(url: string, methods: HTTPMethods[], action: string) {
    let handler = ''

    if (Is.String(this.controller)) {
      handler = `${this.controller}.${action}`
    } else {
      handler = this.controller[action]
    }

    this.routes.push(new Route(url, methods, handler))
  }

  /**
   * Create all the routes.
   */
  private buildRoutes() {
    const resourceTokens = this.resource.split('.')
    const mainResource = resourceTokens.pop()

    const fullUrl = `${resourceTokens
      .map(
        string =>
          `${string}/:${String.toSnakeCase(String.singularize(string))}_id`,
      )
      .join('/')}/${mainResource}`

    this.makeRoute(fullUrl, ['GET'], 'index')
    this.makeRoute(fullUrl, ['POST'], 'store')
    this.makeRoute(`${fullUrl}/:id`, ['GET'], 'show')
    this.makeRoute(`${fullUrl}/:id`, ['PUT', 'PATCH'], 'update')
    this.makeRoute(`${fullUrl}/:id`, ['DELETE'], 'delete')
  }
}
