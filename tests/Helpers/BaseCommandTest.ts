/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config, Rc } from '@athenna/config'
import { ViewProvider } from '@athenna/view'
import { File, Folder } from '@athenna/common'
import { LoggerProvider } from '@athenna/logger'
import { ExitFaker, AfterEach, BeforeEach } from '@athenna/test'
import { ConsoleKernel, ArtisanProvider } from '@athenna/artisan'

export class BaseCommandTest {
  public artisan = Path.pwd('bin/artisan.ts')
  public originalPackageJson = new File(Path.pwd('package.json')).getContentAsStringSync()

  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    ExitFaker.fake()

    process.env.IS_TS = 'true'

    await Config.loadAll(Path.stubs('config'))

    new ViewProvider().register()
    new LoggerProvider().register()
    new ArtisanProvider().register()

    await Rc.setFile(Path.pwd('.athennarc.json'), true)

    const kernel = new ConsoleKernel()

    await kernel.registerExceptionHandler()
    await kernel.registerCommands(['node', 'artisan'])
  }

  @AfterEach()
  public async afterEach() {
    ExitFaker.release()

    await Folder.safeRemove(Path.app())
    await Folder.safeRemove(Path.stubs('storage'))

    await new File(Path.pwd('package.json')).setContent(this.originalPackageJson)
  }
}
