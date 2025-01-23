/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type {
  MiddlewareRouteType,
  TerminatorRouteType,
  InterceptorRouteType
} from '#src/types'

import { Route } from '#src/router/Route'
import { Macroable } from '@athenna/common'
import { RouteResource } from '#src/router/RouteResource'

export class RouteGroup extends Macroable {
  /**
   * All routes registered in the group.
   */
  // eslint-disable-next-line no-use-before-define
  public routes: (Route | RouteGroup | RouteResource)[]

  public constructor(routes: (Route | RouteGroup | RouteResource)[]) {
    super()

    this.routes = routes
  }

  /**
   * Define prefix for all the routes in the group.
   *
   * @example
   * ```ts
   * Route.group(() => {
   *
   * }).prefix('/api/v1')
   * ```
   */
  public prefix(prefix: string): RouteGroup {
    this.routes.forEach(route => this.invoke(route, 'prefix', [prefix]))

    return this
  }

  /**
   * Define a name for all the routes in the group.
   *
   * @example
   * ```ts
   * Route.group(() => {
   *
   * }).name('users')
   * ```
   */
  public name(name: string): RouteGroup {
    this.routes.forEach(route => this.invoke(route, 'name', [name]))

    return this
  }

  /**
   * Add a validator to all routes in the group.
   *
   * @example
   * ```ts
   * Route.group(() => {
   *
   * }).validator('auth')
   * ```
   */
  public validator(validator: MiddlewareRouteType): RouteGroup {
    this.routes.forEach(route =>
      this.invoke(route, 'validator', [validator, true])
    )

    return this
  }

  /**
   * Add a middleware to all routes in the group.
   *
   * @example
   * ```ts
   * Route.group(() => {
   *
   * }).middleware('auth')
   * ```
   */
  public middleware(middleware: MiddlewareRouteType): RouteGroup {
    this.routes.forEach(route =>
      this.invoke(route, 'middleware', [middleware, true])
    )

    return this
  }

  /**
   * Add an interceptor to all routes in the group.
   *
   * @example
   * ```ts
   * Route.group(() => {
   *
   * }).interceptor('response')
   * ```
   */
  public interceptor(interceptor: InterceptorRouteType): RouteGroup {
    this.routes.forEach(route =>
      this.invoke(route, 'interceptor', [interceptor, true])
    )

    return this
  }

  /**
   * Add a terminator to all routes in the group.
   *
   * @example
   * ```ts
   * Route.group(() => {
   *
   * }).terminator('log')
   * ```
   */
  public terminator(terminator: TerminatorRouteType): RouteGroup {
    this.routes.forEach(route =>
      this.invoke(route, 'terminator', [terminator, true])
    )

    return this
  }

  /**
   * Set up helmet options for route group.
   *
   * @example
   * ```ts
   * Route.group(() => {
   *
   * }).helmet({
   *  dnsPrefetchControl: { allow: true }
   * })
   * ```
   */
  public helmet(
    options: Omit<import('@fastify/helmet').FastifyHelmetOptions, 'global'>
  ): RouteGroup {
    this.routes.forEach(route => this.invoke(route, 'helmet', [options]))

    return this
  }

  /**
   * Set up rate limit options for route group method.
   *
   * @example
   * ```ts
   * Route.group(() => {
   *
   * }).rateLimit({
   *  max: 3,
   *  timeWindow: '1 minute'
   * })
   * ```
   */
  public rateLimit(
    options: import('@fastify/rate-limit').RateLimitOptions
  ): RouteGroup {
    this.routes.forEach(route => this.invoke(route, 'rateLimit', [options]))

    return this
  }

  /**
   * Invokes a given method with params on the route instance or route
   * resource instance.
   */
  private invoke(
    route: Route | RouteGroup | RouteResource,
    method: string,
    params: any[]
  ) {
    if (route instanceof RouteResource) {
      route.routes.forEach(child => this.invoke(child, method, params))
      return
    }

    if (route instanceof RouteGroup) {
      route.routes.forEach(child => this.invoke(child, method, params))
      return
    }

    route[method](...params)
  }
}
