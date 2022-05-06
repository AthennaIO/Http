/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServiceProvider } from '@athenna/ioc'
import { Exec, Folder, Path } from '@secjs/utils'

export class MiddlewareProvider extends ServiceProvider {
  /**
   * Bootstrap any application services.
   *
   * @return {Promise<void>}
   */
  async boot() {
    const path = Path.app('Http/Middlewares')

    if (!(await Folder.exists(path))) {
      return
    }

    const middlewares = (await new Folder(path).load()).getFilesByPattern(
      '*/**/*.js',
    )

    const promises = middlewares.map(({ href }) => {
      return Exec.getModule(import(href)).then(Middleware => {
        const alias = `App/Http/Middlewares/${Middleware.name}`

        this.container.singleton(alias, Middleware)
      })
    })

    await Promise.all(promises)
  }
}
