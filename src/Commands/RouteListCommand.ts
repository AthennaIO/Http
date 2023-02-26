/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Config } from '@athenna/config'
import { Module } from '@athenna/common'
import { BaseCommand } from '@athenna/artisan'
import { Route, HttpKernel, HttpRouteProvider, HttpServerProvider } from '#src'

export class RouteListCommand extends BaseCommand {
  public routeFilePath = Env('HTTP_ROUTE_FILE_PATH', Path.routes('http.js'))

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

    await this.resolveRoutePathAndImport()

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

  /**
   * Resolve the import path by meta URL and import it.
   */
  private resolveRoutePathAndImport() {
    if (
      this.routeFilePath.includes('./') ||
      this.routeFilePath.includes('../')
    ) {
      this.routeFilePath = resolve(this.routeFilePath)
    }

    if (!this.routeFilePath.startsWith('#')) {
      this.routeFilePath = pathToFileURL(this.routeFilePath).href
    }

    return import.meta
      .resolve(this.routeFilePath, Config.get('rc.meta'))
      .then(meta => Module.get(import(meta)))
  }
}
