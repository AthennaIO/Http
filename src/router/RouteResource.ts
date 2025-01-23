/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type {
  RouteResourceTypes,
  TerminatorRouteType,
  MiddlewareRouteType,
  InterceptorRouteType
} from '#src/types'

import type { HTTPMethods } from 'fastify'
import { Route } from '#src/router/Route'
import { Is, String, Macroable } from '@athenna/common'

export class RouteResource extends Macroable {
  /**
   * All routes registered in the resource.
   */
  public routes: Route[] = []

  /**
   * The resource name.
   */
  public resource: string

  /**
   * The resource controller.
   */
  public controller: any

  public constructor(resource: string, controller: any) {
    super()

    this.resource = resource
    this.controller = controller

    this.buildRoutes()
  }

  /**
   * Set a validator for the route resource.
   *
   * @example
   * ```ts
   * Route.resource('/test', 'TestController').validator('auth')
   * ```
   */
  public validator(
    validator: MiddlewareRouteType,
    prepend?: boolean
  ): RouteResource {
    this.routes.forEach(route => route.validator(validator, prepend))

    return this
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
    middleware: MiddlewareRouteType,
    prepend?: boolean
  ): RouteResource {
    this.routes.forEach(route => route.middleware(middleware, prepend))

    return this
  }

  /**
   * Set a interceptor for the route resource.
   *
   * @example
   * ```ts
   * Route.resource('/test', 'TestController').interceptor('response')
   * ```
   */
  public interceptor(
    interceptor: InterceptorRouteType,
    prepend?: boolean
  ): RouteResource {
    this.routes.forEach(route => route.interceptor(interceptor, prepend))

    return this
  }

  /**
   * Set a terminator for the route resource.
   *
   * @example
   * ```ts
   * Route.resource('/test', 'TestController').terminator('response')
   * ```
   */
  public terminator(
    terminator: TerminatorRouteType,
    prepend?: boolean
  ): RouteResource {
    this.routes.forEach(route => route.terminator(terminator, prepend))

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
  public only(names: RouteResourceTypes[]): RouteResource {
    this.filter(names, true).forEach(route => (route.route.deleted = true))

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
  public except(names: RouteResourceTypes[]): RouteResource {
    this.filter(names, false).forEach(route => (route.route.deleted = true))

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
    options: Omit<import('@fastify/helmet').FastifyHelmetOptions, 'global'>
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
    options: import('@fastify/rate-limit').RateLimitOptions
  ): RouteResource {
    this.routes.forEach(route => route.rateLimit(options))

    return this
  }

  /**
   * Filter routes by name.
   */
  private filter(names: string[], inverse = false) {
    return this.routes.filter(route => {
      const match = names.find(name => route.route.name.endsWith(name))

      return inverse ? !match : match
    })
  }

  /**
   * Create the route.
   */
  private makeRoute(url: string, methods: HTTPMethods[], action: string) {
    let name = ''
    let handler = ''

    if (Is.String(this.controller)) {
      name = `${this.controller}.${action}`
      handler = `${this.controller}.${action}`
    } else {
      name = `${this.controller.constructor.name}.${action}`
      handler = this.controller[action]
    }

    this.routes.push(new Route(url, methods, handler).name(name))
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
          `${string}/:${String.toSnakeCase(String.singularize(string))}_id`
      )
      .join('/')}/${mainResource}`

    this.makeRoute(fullUrl, ['GET'], 'index')
    this.makeRoute(fullUrl, ['POST'], 'store')
    this.makeRoute(`${fullUrl}/:id`, ['GET'], 'show')
    this.makeRoute(`${fullUrl}/:id`, ['PUT'], 'update')
    this.makeRoute(`${fullUrl}/:id`, ['DELETE'], 'delete')
  }
}
