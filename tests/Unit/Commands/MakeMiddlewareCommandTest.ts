/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { ViewProvider } from '@athenna/view'
import { File, Folder } from '@athenna/common'
import { LoggerProvider } from '@athenna/logger'
import { Artisan, ConsoleKernel, ArtisanProvider } from '@athenna/artisan'
import { Test, ExitFaker, AfterEach, BeforeEach, TestContext } from '@athenna/test'

export default class MakeMiddlewareCommandTest {
  private originalPackageJson = new File(Path.pwd('package.json')).getContentAsStringSync()

  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    ExitFaker.fake()

    process.env.IS_TS = 'true'

    await Config.loadAll(Path.stubs('config'))

    new ViewProvider().register()
    new LoggerProvider().register()
    new ArtisanProvider().register()

    const kernel = new ConsoleKernel()

    await kernel.registerExceptionHandler()
    await kernel.registerCommands(['ts-node', 'artisan', 'make:middleware'])
  }

  @AfterEach()
  public async afterEach() {
    ExitFaker.release()

    await Folder.safeRemove(Path.app())

    await new File(Path.pwd('package.json')).setContent(this.originalPackageJson)
  }

  @Test()
  public async shouldBeAbleToCreateAMiddlewareFile({ assert }: TestContext) {
    await Artisan.call('make:middleware TestMiddleware')

    const path = Path.http('Middlewares/TestMiddleware.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#app/Http/Middlewares/TestMiddleware'])
    assert.containsSubset(athennaRc.middlewares, ['#app/Http/Middlewares/TestMiddleware'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: TestContext) {
    await Artisan.call('make:middleware TestMiddleware')
    await Artisan.call('make:middleware TestMiddleware')

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}
