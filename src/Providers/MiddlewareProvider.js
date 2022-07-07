/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Module, Path } from '@secjs/utils'
import { ServiceProvider } from '@athenna/ioc'

export class MiddlewareProvider extends ServiceProvider {
  /**
   * Bootstrap any application services.
   *
   * @return {Promise<void>}
   */
  async boot() {
    const path = Path.app('Http/Middlewares')
    const subAlias = 'App/Http/Middlewares'

    const middlewares = await Module.getAllFromWithAlias(path, subAlias)

    middlewares.forEach(({ alias, module }) => {
      this.container.singleton(alias, module)
    })
  }
}
