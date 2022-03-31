/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Route } from './Route'
import { Is, String } from '@secjs/utils'
import { MiddlewareTypes } from '../Contracts/MiddlewareTypes'
import { HttpMethodTypes } from '../Contracts/HttpMethodTypes'
import { HandlerContract } from '../Contracts/Context/HandlerContract'
import { InterceptHandlerContract } from '../Contracts/Context/Middlewares/Intercept/InterceptHandlerContract'
import { TerminateHandlerContract } from '../Contracts/Context/Middlewares/Terminate/TerminateHandlerContract'
import { MiddlewareContract } from '../Contracts/MiddlewareContract'

export class RouteResource {
  routes: Route[]
  private resource: string
  private readonly controller: any
  private resourceName: string

  constructor(resource: string, controller: any) {
    this.routes = []

    this.resource = resource
    this.controller = controller

    this.resourceName = this.resource
      .split('.')
      .map(string => String.toSnakeCase(string))
      .join('.')

    this.buildRoutes()
  }

  middleware(
    middleware:
      | HandlerContract
      | MiddlewareContract
      | InterceptHandlerContract
      | TerminateHandlerContract
      | string,
    type: MiddlewareTypes = 'handle',
  ): this {
    this.routes.forEach(route => route.middleware(middleware, type))

    return this
  }

  only(names: string[]): this {
    this.filter(names, true).forEach(route => (route.deleted = true))

    return this
  }

  except(names: string[]): this {
    this.filter(names, false).forEach(route => (route.deleted = true))

    return this
  }

  namespace(namespace: string): this {
    this.routes.forEach(route => {
      route.namespace(namespace)
    })

    return this
  }

  as(name: string): this {
    name = String.toSnakeCase(name)

    this.routes.forEach(route => {
      route.as(route.name.replace(this.resourceName, name), false)
    })

    this.resourceName = name

    return this
  }

  private makeRoute(url: string, methods: HttpMethodTypes[], action: string) {
    let handler = ''

    if (Is.String(this.controller)) {
      handler = `${this.controller}.${action}`
    } else {
      handler = this.controller[action]
    }

    const route = new Route(url, methods, handler)

    route.as(`${this.resourceName}.${action}`)
    this.routes.push(route)
  }

  private buildRoutes() {
    this.resource = this.resource.replace(/^\//, '').replace(/\/$/, '')

    const resourceTokens = this.resource.split('.')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mainResource = resourceTokens.pop()!

    const fullUrl = `${resourceTokens
      .map(
        string =>
          `${string}/:${String.toSnakeCase(String.singularize(string))}_id`,
      )
      .join('/')}/${mainResource}`

    this.makeRoute(fullUrl, ['HEAD', 'GET'], 'index')
    this.makeRoute(fullUrl, ['POST'], 'store')
    this.makeRoute(`${fullUrl}/:id`, ['HEAD', 'GET'], 'show')
    this.makeRoute(`${fullUrl}/:id`, ['PUT', 'PATCH'], 'update')
    this.makeRoute(`${fullUrl}/:id`, ['DELETE'], 'delete')
  }

  private filter(names: string[], inverse: boolean) {
    return this.routes.filter(route => {
      const match = names.find(name => route.name.endsWith(name))

      return inverse ? !match : match
    })
  }
}
