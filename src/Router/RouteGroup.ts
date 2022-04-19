/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Route } from 'src/Router/Route'
import { RouteResource } from 'src/Router/RouteResource'
import { MiddlewareTypes } from 'src/Contracts/MiddlewareTypes'
import { MiddlewareContract } from 'src/Contracts/MiddlewareContract'
import { HandlerContract } from 'src/Contracts/Context/HandlerContract'
import { CannotDefineGroupException } from 'src/Exceptions/CannotDefineGroupException'
import { InterceptHandlerContract } from 'src/Contracts/Context/Middlewares/Intercept/InterceptHandlerContract'
import { TerminateHandlerContract } from 'src/Contracts/Context/Middlewares/Terminate/TerminateHandlerContract'

export class RouteGroup {
  routes: (Route | RouteResource | RouteGroup)[]

  constructor(routes: (Route | RouteResource | RouteGroup)[]) {
    this.routes = routes
  }

  prefix(prefix: string): this {
    this.routes.forEach(route => this.invoke(route, 'prefix', [prefix]))
    return this
  }

  as(name: string): this {
    this.routes.forEach(route => this.invoke(route, 'as', [name, true]))
    return this
  }

  namespace(namespace: string): this {
    this.routes.forEach(route => this.invoke(route, 'namespace', [namespace]))
    return this
  }

  middleware(
    middleware:
      | HandlerContract
      | MiddlewareContract
      | InterceptHandlerContract
      | TerminateHandlerContract
      | string,
    type: MiddlewareTypes = 'handle',
    prepend = false,
  ): this {
    this.routes.forEach(route => {
      this.invoke(route, 'middleware', [middleware, type, prepend])
    })

    return this
  }

  private invoke(
    route: Route | RouteResource | RouteGroup,
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

    if (method === 'as' && !route.name) {
      throw new CannotDefineGroupException()
    }

    route[method](...params)
  }
}
