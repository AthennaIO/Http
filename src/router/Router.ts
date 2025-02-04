/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Route } from '#src/router/Route'
import { Server } from '#src/facades/Server'
import { Is, Macroable } from '@athenna/common'
import { RouteGroup } from '#src/router/RouteGroup'
import { RouteResource } from '#src/router/RouteResource'
import type { RouteJson, RequestHandler, RouteHandler } from '#src/types'
import type { HTTPMethods, FastifyInstance, RouteOptions } from 'fastify'
import { UndefinedMethodException } from '#src/exceptions/UndefinedMethodException'

export class Router extends Macroable {
  /**
   * All routes registered.
   */
  public routes: (Route | RouteGroup | RouteResource)[] = []

  /**
   * Route groups opened.
   */
  private openedGroups: RouteGroup[] = []

  /**
   * The controller instance.
   */
  private controllerInstance: any

  /**
   * List the routes registered.
   */
  public list(): RouteJson[] {
    return this.toJSON(this.routes)
  }

  /**
   * Set the controller instance.
   */
  public controller(controller: any) {
    if (Is.String(controller)) {
      controller = ioc.safeUse(`App/Http/Controllers/${controller}`)
    }

    this.controllerInstance = controller

    return this
  }

  /**
   * Add route for a given pattern and methods
   */
  public route(
    pattern: string,
    methods: HTTPMethods[],
    handler: RouteHandler
  ): Route {
    if (this.isValidControllerHandler(handler)) {
      if (!this.controllerInstance[handler]) {
        throw new UndefinedMethodException(
          handler,
          this.controllerInstance.name
        )
      }

      handler = this.controllerInstance[handler]
    }

    const route = new Route(pattern, methods, handler)
    const openedGroup = this.getRecentGroup()

    if (openedGroup) {
      openedGroup.routes.push(route)
    } else {
      this.routes.push(route)
    }

    return route
  }

  /**
   * Creates a vanilla fastify route without using Athenna router.
   */
  public vanillaRoute(options?: RouteOptions): FastifyInstance {
    return Server.fastify.route(options)
  }

  /**
   * Creates a new route resource.
   */
  public resource(resource: string, controller?: any): RouteResource {
    const resourceInstance = new RouteResource(
      resource,
      controller || this.controllerInstance
    )
    const openedGroup = this.getRecentGroup()

    if (openedGroup) {
      openedGroup.routes.push(resourceInstance)
    } else {
      this.routes.push(resourceInstance)
    }

    return resourceInstance
  }

  /**
   * This method is a convenient shortcut to render a view without
   * defining an explicit handler.
   */
  public view(pattern: string, view: string, data?: any): Route {
    return this.route(pattern, ['GET', 'HEAD'], ctx => {
      return ctx.response.view(view, data)
    })
  }

  /**
   * This method is a convenient shortcut to redirect a route without
   * defining an explicit handler.
   */
  public redirect(pattern: string, url: string, status?: number): Route {
    return this.route(pattern, ['GET', 'HEAD'], ctx => {
      return ctx.response.redirectTo(url, status)
    })
  }

  /**
   * Define a route that handles all common HTTP methods.
   */
  public any(pattern: string, handler: RequestHandler): Route {
    return this.route(
      pattern,
      ['HEAD', 'OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      handler
    )
  }

  /**
   * Define GET route.
   */
  public get(pattern: string, handler: RouteHandler): Route {
    return this.route(pattern, ['GET', 'HEAD'], handler)
  }

  /**
   * Define HEAD route.
   */
  public head(pattern: string, handler: RouteHandler): Route {
    return this.route(pattern, ['HEAD'], handler)
  }

  /**
   * Define POST route.
   */
  public post(pattern: string, handler: RouteHandler): Route {
    return this.route(pattern, ['POST'], handler)
  }

  /**
   * Define PUT route.
   */
  public put(pattern: string, handler: RouteHandler): Route {
    return this.route(pattern, ['PUT'], handler)
  }

  /**
   * Define PATCH route.
   */
  public patch(pattern: string, handler: RouteHandler): Route {
    return this.route(pattern, ['PATCH'], handler)
  }

  /**
   * Define DELETE route.
   */
  public delete(pattern: string, handler: RouteHandler): Route {
    return this.route(pattern, ['DELETE'], handler)
  }

  /**
   * Define OPTIONS route.
   */
  public options(pattern: string, handler: RouteHandler): Route {
    return this.route(pattern, ['OPTIONS'], handler)
  }

  /**
   * Creates a group of routes. Anything applied in route groups will be applied
   * in the routes that are inside that group.
   */
  public group(callback: () => void): RouteGroup {
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

  /**
   * Register all the routes inside the http server. After routes are registered,
   * anyone could be registered anymore.
   */
  public register() {
    this.toJSON(this.routes).forEach(route => Server.route(route))
  }

  /**
   * Transform some route array to a route json array.
   */
  public toJSON(routes: (Route | RouteGroup | RouteResource)[]): RouteJson[] {
    return routes.reduce<RouteJson[]>(
      (list: RouteJson[], route: Route | RouteGroup | RouteResource) => {
        if (route instanceof RouteGroup) {
          list = list.concat(this.toJSON(route.routes))

          return list
        }

        if (route instanceof RouteResource) {
          list = list.concat(this.toJSON(route.routes))

          return list
        }

        if (!route.route.deleted) {
          list.push(route.toJSON())
        }

        return list
      },
      []
    )
  }

  /**
   * Get the most recent route group created.
   */
  private getRecentGroup() {
    return this.openedGroups[this.openedGroups.length - 1]
  }

  /**
   * Indicates if if a valid controller handler method.
   */
  private isValidControllerHandler(handler: RouteHandler): handler is string {
    return (
      this.controllerInstance && Is.String(handler) && !handler.includes('.')
    )
  }
}
