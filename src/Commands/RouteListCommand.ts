/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseCommand } from '@athenna/artisan'
import { Route, HttpKernel, HttpRouteProvider, HttpServerProvider } from '#src'

export class RouteListCommand extends BaseCommand {
  public routeFilePath = Env(
    'HTTP_ROUTE_FILE_PATH',
    Path.routes(`http.${Path.ext()}`),
  )

  public static signature(): string {
    return 'route:list'
  }

  public static description(): string {
    return 'List all the http routes registered in your application.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ LISTING ROUTES ])\n')

    new HttpServerProvider().register()
    new HttpRouteProvider().register()

    const kernel = new HttpKernel()

    await kernel.registerControllers()
    await kernel.registerMiddlewares()

    await import(this.routeFilePath)

    const routes = Route.list()
    const table = this.logger.table()

    table.head('Methods', 'Route', 'Name', 'Handler')

    routes.forEach(route => {
      if (route.deleted) {
        return
      }

      table.row([
        route.methods.join('|'),
        route.url,
        route.name || 'Not found',
        route.handler.name || 'closure',
      ])
    })

    table.render()
  }
}
