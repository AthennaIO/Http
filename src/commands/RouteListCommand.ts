/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { Module } from '@athenna/common'
import { BaseCommand } from '@athenna/artisan'
import { Route, HttpKernel, HttpRouteProvider, HttpServerProvider } from '#src'

export class RouteListCommand extends BaseCommand {
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

    const kernel = new (await this.getHttpKernel())()

    await kernel.registerControllers()
    await kernel.registerMiddlewares()

    await this.resolveRoute()

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
        route.handler.name || 'closure'
      ])
    })

    table.render()
  }

  /**
   * Resolve the http routes file.
   */
  private async resolveRoute() {
    await Module.resolve(
      Config.get('rc.commands.route:list.route', '#routes/http'),
      Config.get('rc.meta')
    )
  }

  /**
   * Get the http kernel module from RC file or resolve the default one.
   */
  private async getHttpKernel() {
    if (!Config.exists('rc.commands.route:list.kernel')) {
      return HttpKernel
    }

    return Module.resolve(
      Config.get('rc.commands.route:list.kernel'),
      Config.get('rc.meta')
    )
  }
}
