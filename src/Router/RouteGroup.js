/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RouteResource } from '#src/Router/RouteResource'

export class RouteGroup {
  /**
   * All routes registered in the group.
   *
   * @type {(import('./Route.js').Route | RouteResource | RouteGroup)[]}
   */
  routes

  /**
   * Creates a new instance of RouteGroup.
   *
   * @param {(import('./Route.js').Route | RouteResource | RouteGroup)[]} routes
   */
  constructor(routes) {
    this.routes = routes
  }

  /**
   * Set a prefix for the route group.
   *
   * @param {string} prefix
   * @return {RouteGroup}
   */
  prefix(prefix) {
    this.routes.forEach(route => this.#invoke(route, 'prefix', [prefix]))

    return this
  }

  /**
   * Set a middleware for the route group.
   *
   * @param {string|any} middleware
   * @param {'handle'|'intercept'|'terminate'} type
   * @param {boolean} prepend
   * @return {RouteGroup}
   */
  middleware(middleware, type = 'handle', prepend = false) {
    this.routes.forEach(route => {
      this.#invoke(route, 'middleware', [middleware, type, prepend])
    })

    return this
  }

  /**
   * Invoke a method from route.
   *
   * @param {import('./Route.js').Route|RouteResource|RouteGroup} route
   * @param {string} method
   * @param {any[]} params
   */
  #invoke(route, method, params) {
    if (route instanceof RouteResource) {
      route.routes.forEach(child => this.#invoke(child, method, params))
      return
    }

    if (route instanceof RouteGroup) {
      route.routes.forEach(child => this.#invoke(child, method, params))
      return
    }

    route[method](...params)
  }
}
