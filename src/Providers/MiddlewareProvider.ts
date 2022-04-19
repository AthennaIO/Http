/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServiceProvider } from '@athenna/ioc'
import { Path, resolveModule } from '@secjs/utils'
import { getAppFiles } from 'src/Utils/getAppFiles'

export class MiddlewareProvider extends ServiceProvider {
  /**
   * Bootstrap any application services.
   *
   * @return void
   */
  public async boot(): Promise<void> {
    let middlewares = getAppFiles(Path.app('Http/Middlewares'))
    middlewares = await Promise.all(middlewares.map(File => import(File.path)))

    middlewares.forEach(Module => {
      const Controller = resolveModule(Module)
      this.container.bind(`App/Http/Middlewares/${Controller.name}`, Controller)
    })
  }
}
