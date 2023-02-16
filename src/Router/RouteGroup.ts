/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Route } from '#src/Router/Route'
import { RouteResource } from '#src/Router/RouteResource'
import { MiddlewareHandlerExt } from '#src/Types/Middlewares/MiddlewareHandler'

export class RouteGroup {
  /**
   * All routes registered in the group.
   */
  // eslint-disable-next-line no-use-before-define
  public routes: (Route | RouteGroup | RouteResource)[]

  /**
   * Array of middleware registered on the group
   */
  private groupMiddleware: MiddlewareHandlerExt[] = []

  /**
   * We register the group middleware only once with the route and then mutate the internal stack.
   * This ensures that group own middleware are pushed to the last, but the entire group of middleware
   * is added to the front in the routes.
   */
  private registeredMiddlewareWithRoute = false

  public constructor(routes: (Route | RouteGroup | RouteResource)[]) {
    this.routes = routes
  }

  /**
   * Define prefix all the routes in the group.
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
   * Add a middleware to all routes middleware.
   *
   * @example
   * ```ts
   * Route.group(() => {
   *
   * }).middleware('auth')
   * ```
   */
  public middleware(
    middleware: MiddlewareHandlerExt,
    prepend = false,
  ): RouteGroup {
    if (prepend) {
      this.groupMiddleware.unshift(middleware)
    } else {
      this.groupMiddleware.push(middleware)
    }

    if (!this.registeredMiddlewareWithRoute) {
      this.registeredMiddlewareWithRoute = true

      this.routes.forEach(route =>
        this.invoke(route, 'middleware', [this.groupMiddleware, true]),
      )
    }

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
    options: Omit<import('@fastify/helmet').FastifyHelmetOptions, 'global'>,
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
    options: import('@fastify/rate-limit').RateLimitOptions,
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
    params: any[],
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
