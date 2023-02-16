/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@athenna/common'
import { Route } from '#src/Router/Route'
import { Server } from '#src/Facades/Server'
import { RouteGroup } from '#src/Router/RouteGroup'
import { RouteJSON } from '#src/Types/Router/RouteJSON'
import { RouteResource } from '#src/Router/RouteResource'
import { RequestHandler } from '#src/Types/Contexts/Context'
import { RouteHandler } from '#src/Types/Router/RouteHandler'
import { HTTPMethods, FastifyInstance, RouteOptions } from 'fastify'

export class Router {
  /**
   * All routes registered.
   */
  public routes: (Route | RouteGroup | RouteResource)[]

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
  public listRoutes(): RouteJSON[] {
    return this.toJSON(this.routes)
  }

  /**
   * Set the controller instance.
   */
  public controller(controller: any) {
    this.controllerInstance = controller

    return this
  }

  /**
   * Add route for a given pattern and methods
   */
  public route(
    pattern: string,
    methods: HTTPMethods[],
    handler: RouteHandler,
  ): Route {
    if (this.isValidControllerHandler(handler)) {
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
  public resource(resource: string, controller: any): RouteResource {
    const resourceInstance = new RouteResource(resource, controller)
    const openedGroup = this.getRecentGroup()

    if (openedGroup) {
      openedGroup.routes.push(resourceInstance)
    } else {
      this.routes.push(resourceInstance)
    }

    return resourceInstance
  }

  /**
   * Define a route that handles all common HTTP methods.
   */
  public any(pattern: string, handler: RequestHandler): Route {
    return this.route(
      pattern,
      ['HEAD', 'OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      handler,
    )
  }

  /**
   * Define GET route.
   */
  public get(pattern: string, handler: RouteHandler): Route {
    return this.route(pattern, ['GET', 'HEAD'], handler)
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
   * Register all the routes inside the Server. After routes are registered,
   * anyone could be registered anymore.
   */
  public register() {
    this.toJSON(this.routes).forEach(route => {
      route.methods.forEach(method => {
        Server[method.toLowerCase()](
          route.url,
          route.handler,
          route.middlewares,
          {
            helmet: route.helmetOptions,
            schema: route.fastifySchema,
            config: { rateLimit: route.rateLimitOptions },
          },
        )
      })
    })
  }

  /**
   * Transform some route array to a route json array.
   */
  public toJSON(routes: (Route | RouteGroup | RouteResource)[]): RouteJSON[] {
    return routes.reduce<RouteJSON[]>(
      (list: RouteJSON[], route: Route | RouteGroup | RouteResource) => {
        if (route instanceof RouteGroup) {
          list = list.concat(this.toJSON(route.routes))

          return list
        }

        if (route instanceof RouteResource) {
          list = list.concat(this.toJSON(route.routes))

          return list
        }

        if (!route.deleted) {
          list.push(route.toJSON())
        }

        return list
      },
      [],
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
