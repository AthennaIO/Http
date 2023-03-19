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

export default class MakeInterceptorCommandTest {
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
    await kernel.registerCommands(['ts-node', 'artisan', 'make:interceptor'])
  }

  @AfterEach()
  public async afterEach() {
    ExitFaker.release()

    await Folder.safeRemove(Path.app())
    await Folder.safeRemove(Path.stubs('storage'))

    await new File(Path.pwd('package.json')).setContent(this.originalPackageJson)
  }

  @Test()
  public async shouldBeAbleToCreateAInterceptorFile({ assert }: TestContext) {
    await Artisan.call('make:interceptor TestInterceptor')

    const path = Path.http('Interceptors/TestInterceptor.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#app/Http/Interceptors/TestInterceptor'])
    assert.containsSubset(athennaRc.middlewares, ['#app/Http/Interceptors/TestInterceptor'])
  }

  @Test()
  public async shouldBeAbleToCreateAInterceptorFileWithDifferentDestPath({ assert }: TestContext) {
    Config.set('rc.commandsManifest.make:interceptor.path', Config.get('rc.commandsManifest.make:interceptor'))
    Config.set('rc.commandsManifest.make:interceptor.destination', Path.stubs('storage/interceptors'))

    await Artisan.call('make:interceptor TestInterceptor')

    const path = Path.stubs('storage/interceptors/TestInterceptor.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#tests/Stubs/storage/interceptors/TestInterceptor'])
    assert.containsSubset(athennaRc.middlewares, ['#tests/Stubs/storage/interceptors/TestInterceptor'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: TestContext) {
    await Artisan.call('make:interceptor TestInterceptor')
    await Artisan.call('make:interceptor TestInterceptor')

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}
