/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exec, Folder, Path } from '@secjs/utils'
import { ServiceProvider } from '@athenna/ioc'

export class ControllerProvider extends ServiceProvider {
  /**
   * Bootstrap any application services.
   *
   * @return {Promise<void>}
   */
  async boot() {
    const path = Path.app('Http/Controllers')

    if (!(await Folder.exists(path))) {
      return
    }

    const controllers = (await new Folder(path).load()).getFilesByPattern(
      '*/**/*.js',
    )

    const promises = controllers.map(({ href }) => {
      return Exec.getModule(import(href)).then(Controller => {
        const alias = `App/Http/Controllers/${Controller.name}`

        this.container.singleton(alias, Controller)
      })
    })

    await Promise.all(promises)
  }
}
