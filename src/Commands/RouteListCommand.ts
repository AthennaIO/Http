/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseCommand, Option } from '@athenna/artisan'

export class RouteListCommand extends BaseCommand {
  @Option({
    default: false,
    signature: '-m, --middleware',
    description: 'List the middlewares of each route.',
  })
  public addMiddleware: boolean

  public static signature(): string {
    return 'route:list'
  }

  public static description(): string {
    return 'List all the http routes registered in your application.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ LISTING ROUTES ])\n')
  }
}
