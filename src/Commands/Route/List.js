/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Command } from '@athenna/artisan'
import { Module, Path, String } from '@secjs/utils'

import { Route } from '#src/index'

export class RouteList extends Command {
  /**
   * The name and signature of the console command.
   *
   * @return {string}
   */
  get signature() {
    return 'route:list'
  }

  /**
   * The console command description.
   *
   * @return {string}
   */
  get description() {
    return 'List all the routes of your application.'
  }

  /**
   * Set additional flags in the commander instance.
   * This method is executed when registering your command.
   *
   * @param {import('commander').Command} commander
   * @return {import('commander').Command}
   */
  addFlags(commander) {
    return commander.option(
      '-m, --middleware',
      'List the middlewares of each route.',
      false,
    )
  }

  /**
   * Execute the console command.
   *
   * @param {any} options
   * @return {Promise<void>}
   */
  async handle(options) {
    this.title('ROUTE LISTING\n', 'bold', 'green')

    const Kernel = await Module.getFrom(Path.http('Kernel.js'))

    const kernel = new Kernel()

    await kernel.registerCors()
    await kernel.registerRateLimit()
    await kernel.registerMiddlewares()
    await kernel.registerErrorHandler()
    await kernel.registerLogMiddleware()
    await kernel.registerRequestIdMiddleware()

    const routePath = Path.routes('http.js')

    await import(routePath)
    const routes = Route.listRoutes()

    const header = ['Method', 'Route', 'Handler']
    const rows = []

    if (options.middleware) header.push('Middlewares')

    routes.forEach(route => {
      const row = [route.methods.join('|'), route.url, 'Closure']

      if (options.middleware) {
        let middlewares = ''

        Object.keys(route.middlewares).forEach(key => {
          if (route.middlewares[key].length) {
            const number = route.middlewares[key].length

            if (middlewares) {
              middlewares = middlewares + '\n'
            }

            middlewares = middlewares + `${String.toPascalCase(key)}: ${number}`
          }
        })

        if (!middlewares) middlewares = 'Not found'

        row.push(middlewares)
      }

      rows.push(row)
    })

    this.log(this.createTable({ head: header }, ...rows))
  }
}
