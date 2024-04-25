/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { sep } from 'node:path'
import { Config } from '@athenna/config'
import { BaseCommand } from '@athenna/artisan'
import { Path, Module } from '@athenna/common'
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
        route.methods.map(m => this.paintMethod(m)).join('|'),
        route.url,
        route.name || 'Not defined',
        route.handler.name || 'closure'
      ])
    })

    table.render()
  }

  /**
   * Paint a method by its name.
   */
  private paintMethod(method: string) {
    const colors = {
      GET: this.paint.purple.bold(method),
      POST: this.paint.green.bold(method),
      PUT: this.paint.orange.bold(method),
      PATCH: this.paint.yellow.bold(method),
      DELETE: this.paint.red.bold(method),
      OPTIONS: this.paint.cyan.bold(method),
      HEAD: this.paint.cyan.bold(method)
    }

    return colors[method]
  }

  /**
   * Resolve the http routes file.
   */
  private async resolveRoute() {
    const path = Config.get(
      'rc.commands.route:list.route',
      Path.routes(`http.${Path.ext()}`)
    )

    await Module.resolve(path, this.getParentURL())
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
      this.getParentURL()
    )
  }

  /**
   * Get the parent URL of the project.
   */
  private getParentURL() {
    return Config.get('rc.parentURL', Path.toHref(Path.pwd() + sep))
  }
}
