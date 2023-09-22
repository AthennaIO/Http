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
import { ConsoleKernel, ArtisanProvider } from '@athenna/artisan'
import { AfterEach, BeforeEach, Mock, type Stub } from '@athenna/test'

export class BaseCommandTest {
  public artisan = Path.pwd('bin/artisan.ts')
  public processExit: Stub
  public originalPackageJson = new File(Path.pwd('package.json')).getContentAsStringSync()

  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    this.processExit = Mock.when(process, 'exit').return(undefined)

    process.env.IS_TS = 'true'

    await Config.loadAll(Path.fixtures('config'))

    new ViewProvider().register()
    new LoggerProvider().register()
    new ArtisanProvider().register()

    await Rc.setFile(Path.pwd('package.json'))

    const kernel = new ConsoleKernel()

    await kernel.registerExceptionHandler()
    await kernel.registerCommands(['node', 'artisan'])
  }

  @AfterEach()
  public async afterEach() {
    this.processExit.restore()

    await Folder.safeRemove(Path.app())
    await Folder.safeRemove(Path.fixtures('storage'))

    await new File(Path.pwd('package.json')).setContent(this.originalPackageJson)
  }
}
