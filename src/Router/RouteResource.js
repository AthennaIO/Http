/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Route } from '#src/Router/Route'
import { Is, String } from '@secjs/utils'

export class RouteResource {
  /**
   * All routes registered in the resource.
   *
   * @type {Route[]}
   */
  routes

  /**
   * The resource name.
   *
   * @type {string}
   */
  #resource

  /**
   * The resource controller.
   *
   * @type {any}
   */
  #controller

  /**
   * The resource name.
   *
   * @type {string}
   */
  #resourceName

  /**
   * Creates a new instance of RouteResource.
   *
   * @param {string} resource
   * @param {any} controller
   * @return {RouteResource}
   */
  constructor(resource, controller) {
    this.routes = []

    this.#resource = resource
    this.#controller = controller

    this.#resourceName = this.#resource
      .split('.')
      .map(string => String.toSnakeCase(string))
      .join('.')

    this.#buildRoutes()
  }

  /**
   * Set a middleware for the route group.
   *
   * @param {string|any} middleware
   * @param {'handle'|'intercept'|'terminate'} type
   * @return {RouteResource}
   */
  middleware(middleware, type = 'handle') {
    this.routes.forEach(route => route.middleware(middleware, type))

    return this
  }

  /**
   * Register only the methods in the array.
   *
   * @param {string[]} names
   * @return {RouteResource}
   */
  only(names) {
    this.#filter(names, true).forEach(route => (route.deleted = true))

    return this
  }

  /**
   * Register all methods except the methods in the array.
   *
   * @param {string[]} names
   * @return {RouteResource}
   */
  except(names) {
    this.#filter(names, false).forEach(route => (route.deleted = true))

    return this
  }

  /**
   * Create the route.
   *
   * @param {string} url
   * @param {string[]} methods
   * @param {string} action
   * return {void}
   */
  #makeRoute(url, methods, action) {
    let handler = ''

    if (Is.String(this.#controller)) {
      handler = `${this.#controller}.${action}`
    } else {
      handler = this.#controller[action]
    }

    const route = new Route(
      url,
      methods,
      handler,
      `${this.#resourceName}.${action}`,
    )

    this.routes.push(route)
  }

  /**
   * Build all the routes of the resource.
   *
   * @return {void}
   */
  #buildRoutes() {
    this.#resource = this.#resource.replace(/^\//, '').replace(/\/$/, '')

    const resourceTokens = this.#resource.split('.')
    const mainResource = resourceTokens.pop()

    const fullUrl = `${resourceTokens
      .map(
        string =>
          `${string}/:${String.toSnakeCase(String.singularize(string))}_id`,
      )
      .join('/')}/${mainResource}`

    this.#makeRoute(fullUrl, ['HEAD', 'GET'], 'index')
    this.#makeRoute(fullUrl, ['POST'], 'store')
    this.#makeRoute(`${fullUrl}/:id`, ['HEAD', 'GET'], 'show')
    this.#makeRoute(`${fullUrl}/:id`, ['PUT', 'PATCH'], 'update')
    this.#makeRoute(`${fullUrl}/:id`, ['DELETE'], 'delete')
  }

  /**
   * Filter the routes by name.
   *
   * @param {string[]} names
   * @param {boolean} inverse
   * @return {Route[]}
   */
  #filter(names, inverse) {
    return this.routes.filter(route => {
      const match = names.find(name => route.name.endsWith(name))

      return inverse ? !match : match
    })
  }
}
