/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File } from '@athenna/common'
import { Config } from '@athenna/config'
import { Artisan } from '@athenna/artisan'
import { Test, ExitFaker, TestContext } from '@athenna/test'
import { BaseCommandTest } from '#tests/Helpers/BaseCommandTest'

export default class MakeInterceptorCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAInterceptorFile({ assert }: TestContext) {
    await Artisan.call('make:interceptor TestInterceptor', false)

    const path = Path.http('Interceptors/TestInterceptor.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#app/Http/Interceptors/TestInterceptor'])
    assert.containsSubset(athennaRc.middlewares, ['#app/Http/Interceptors/TestInterceptor'])
  }

  @Test()
  public async shouldBeAbleToCreateAInterceptorFileWithDifferentDestPath({ assert }: TestContext) {
    Config.set('rc.commands.make:interceptor.path', Config.get('rc.commands.make:interceptor'))
    Config.set('rc.commands.make:interceptor.destination', Path.stubs('storage/interceptors'))

    await Artisan.call('make:interceptor TestInterceptor', false)

    const path = Path.stubs('storage/interceptors/TestInterceptor.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#tests/Stubs/storage/interceptors/TestInterceptor'])
    assert.containsSubset(athennaRc.middlewares, ['#tests/Stubs/storage/interceptors/TestInterceptor'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: TestContext) {
    await Artisan.call('make:interceptor TestInterceptor', false)
    await Artisan.call('make:interceptor TestInterceptor', false)

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}
