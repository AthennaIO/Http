/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import '@athenna/ioc'

import { Http } from '../Http'
import { Route } from './Route'
import { Is } from '@secjs/utils'
import { RouteGroup } from './RouteGroup'
import { RouteResource } from './RouteResource'
import { HttpMethodTypes } from '../Contracts/HttpMethodTypes'
import { HandlerContract } from '../Contracts/Context/HandlerContract'

export class Router {
  routes: (Route | RouteResource | RouteGroup)[]
  private readonly openedGroups: RouteGroup[]

  private getRecentGroup() {
    return this.openedGroups[this.openedGroups.length - 1]
  }

  private readonly http: Http
  private controllerInstance: any

  constructor(http: Http) {
    this.http = http
    this.routes = []
    this.openedGroups = []
  }

  listRoutes() {
    return this.toRoutesJSON(this.routes)
  }

  controller(controller: any): this {
    this.controllerInstance = controller

    return this
  }

  route(
    url: string,
    methods: HttpMethodTypes[],
    handler: HandlerContract | string,
  ): Route {
    if (
      this.controllerInstance &&
      Is.String(handler) &&
      !handler.includes('.')
    ) {
      handler = this.controllerInstance[handler]
    }

    const route = new Route(url, methods, handler)
    const openedGroup = this.getRecentGroup()

    if (openedGroup) {
      openedGroup.routes.push(route)
    } else {
      this.routes.push(route)
    }

    return route
  }

  group(callback: () => void): RouteGroup {
    const group = new RouteGroup([])

    const openedGroup = this.getRecentGroup()

    if (openedGroup) {
      openedGroup.routes.push(group)
    } else {
      this.routes.push(group)
    }

    this.openedGroups.push(group)
    callback()

    this.openedGroups.pop()

    return group
  }

  resource(resource: string, controller: any): RouteResource {
    const resourceInstance = new RouteResource(resource, controller)
    const openedGroup = this.getRecentGroup()

    if (openedGroup) {
      openedGroup.routes.push(resourceInstance)
    } else {
      this.routes.push(resourceInstance)
    }

    return resourceInstance
  }

  get(url: string, handler: HandlerContract | string): Route {
    return this.route(url, ['GET', 'HEAD'], handler)
  }

  head(url: string, handler: HandlerContract | string): Route {
    return this.route(url, ['HEAD'], handler)
  }

  post(url: string, handler: HandlerContract | string): Route {
    return this.route(url, ['POST'], handler)
  }

  put(url: string, handler: HandlerContract | string): Route {
    return this.route(url, ['PUT'], handler)
  }

  patch(url: string, handler: HandlerContract | string): Route {
    return this.route(url, ['PATCH'], handler)
  }

  delete(url: string, handler: HandlerContract | string): Route {
    return this.route(url, ['DELETE'], handler)
  }

  options(url: string, handler: HandlerContract | string): Route {
    return this.route(url, ['OPTIONS'], handler)
  }

  any(url: string, handler: HandlerContract | string): Route {
    return this.route(
      url,
      ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      handler,
    )
  }

  register() {
    this.toRoutesJSON(this.routes).forEach(route => {
      route.methods.forEach(method => {
        this.http[method.toLowerCase()](
          route.url,
          route.handler,
          route.middlewares,
        )
      })
    })
  }

  toRoutesJSON(routes?: any) {
    return routes.reduce((list: any[], route) => {
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
}
