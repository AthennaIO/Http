/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@secjs/utils'

import { Route } from '#src/Router/Route'
import { Server } from '#src/Facades/Server'
import { RouteGroup } from '#src/Router/RouteGroup'
import { RouteResource } from '#src/Router/RouteResource'

export class Router {
  /**
   * All routes registered.
   *
   * @type {(Route | RouteResource | RouteGroup)[]}
   */
  routes

  /**
   * Route groups opened.
   *
   * @type {RouteGroup[]}
   */
  #openedGroups

  /**
   * The controller instance.
   *
   * @type {any}
   */
  #controllerInstance

  constructor() {
    this.routes = []
    this.#openedGroups = []
  }

  /**
   * List the routes registered.
   *
   * @return {any}
   */
  listRoutes() {
    return this.toRoutesJSON(this.routes)
  }

  /**
   * Set the controller instance.
   *
   * @param {any} controller
   * @return {Router}
   */
  controller(controller) {
    this.#controllerInstance = controller

    return this
  }

  /**
   * Register a new route.
   *
   * @param {string} url
   * @param {string[]} methods
   * @param {string|any} handler
   * @return {Route}
   */
  route(url, methods, handler) {
    if (
      this.#controllerInstance &&
      Is.String(handler) &&
      !handler.includes('.')
    ) {
      handler = this.#controllerInstance[handler]
    }

    const route = new Route(url, methods, handler)
    const openedGroup = this.#getRecentGroup()

    if (openedGroup) {
      openedGroup.routes.push(route)
    } else {
      this.routes.push(route)
    }

    return route
  }

  /**
   * Creates a new route group.
   *
   * @param {() => void} callback
   * @return {RouteGroup}
   */
  group(callback) {
    const group = new RouteGroup([])

    const openedGroup = this.#getRecentGroup()

    if (openedGroup) {
      openedGroup.routes.push(group)
    } else {
      this.routes.push(group)
    }

    this.#openedGroups.push(group)
    callback()

    this.#openedGroups.pop()

    return group
  }

  /**
   * Creates a new route resource.
   *
   * @param {string} resource
   * @param {any} controller
   * @return {RouteResource}
   */
  resource(resource, controller) {
    const resourceInstance = new RouteResource(resource, controller)
    const openedGroup = this.#getRecentGroup()

    if (openedGroup) {
      openedGroup.routes.push(resourceInstance)
    } else {
      this.routes.push(resourceInstance)
    }

    return resourceInstance
  }

  /**
   * Creates a new redirect route.
   *
   * @param {string} url
   * @param {string} redirectTo
   * @param {number} [status]
   * @return {Route}
   */
  redirect(url, redirectTo, status = 302) {
    return this.any(url, ({ response }) =>
      response.redirectTo(redirectTo, status),
    )
  }

  /**
   * Register a new get method route.
   *
   * @param {string} url
   * @param {string|any} handler
   * @return {Route}
   */
  get(url, handler) {
    return this.route(url, ['GET', 'HEAD'], handler)
  }

  /**
   * Register a new head method route.
   *
   * @param {string} url
   * @param {string|any} handler
   * @return {Route}
   */
  head(url, handler) {
    return this.route(url, ['HEAD'], handler)
  }

  /**
   * Register a new post method route.
   *
   * @param {string} url
   * @param {string|any} handler
   * @return {Route}
   */
  post(url, handler) {
    return this.route(url, ['POST'], handler)
  }

  /**
   * Register a new put method route.
   *
   * @param {string} url
   * @param {string|any} handler
   * @return {Route}
   */
  put(url, handler) {
    return this.route(url, ['PUT'], handler)
  }

  /**
   * Register a new patch method route.
   *
   * @param {string} url
   * @param {string|any} handler
   * @return {Route}
   */
  patch(url, handler) {
    return this.route(url, ['PATCH'], handler)
  }

  /**
   * Register a new delete method route.
   *
   * @param {string} url
   * @param {string|any} handler
   * @return {Route}
   */
  delete(url, handler) {
    return this.route(url, ['HEAD'], handler)
  }

  /**
   * Register a new options method route.
   *
   * @param {string} url
   * @param {string|any} handler
   * @return {Route}
   */
  options(url, handler) {
    return this.route(url, ['OPTIONS'], handler)
  }

  /**
   * Register a new route with all methods.
   *
   * @param {string} url
   * @param {string|any} handler
   * @return {Route}
   */
  any(url, handler) {
    return this.route(
      url,
      ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      handler,
    )
  }

  /**
   * Register all the routes inside the Server.
   *
   * @param {string} url
   * @param {string|any} handler
   * @return {Route}
   */
  register() {
    this.toRoutesJSON(this.routes).forEach(route => {
      route.methods.forEach(method => {
        Server[method.toLowerCase()](
          route.url,
          route.handler,
          route.middlewares,
        )
      })
    })
  }

  /**
   * Transform the routes to JSON Object.
   *
   * @param {any[]} [routes]
   */
  toRoutesJSON(routes) {
    return routes.reduce((list, route) => {
      if (route instanceof RouteGroup) {
        list = list.concat(this.toRoutesJSON(route.routes))
        return list
      }

      if (route instanceof RouteResource) {
        list = list.concat(this.toRoutesJSON(route.routes))
        return list
      }

      if (!route.deleted) {
        list.push(route.toJSON())
      }

      return list
    }, [])
  }

  /**
   * Returns the recent group.
   *
   * @return {RouteGroup}
   */
  #getRecentGroup() {
    return this.#openedGroups[this.#openedGroups.length - 1]
  }
}
