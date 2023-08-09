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
import { Test, ExitFaker, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class MakeInterceptorCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAInterceptorFile({ assert }: Context) {
    await Artisan.call('make:interceptor TestInterceptor', false)

    const path = Path.interceptors('TestInterceptor.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#app/http/interceptors/TestInterceptor'])
    assert.containsSubset(athennaRc.middlewares, ['#app/http/interceptors/TestInterceptor'])
  }

  @Test()
  public async shouldBeAbleToCreateAInterceptorFileWithDifferentDestPath({ assert }: Context) {
    Config.set('rc.commands.make:interceptor.path', Config.get('rc.commands.make:interceptor'))
    Config.set('rc.commands.make:interceptor.destination', Path.stubs('storage/interceptors'))

    await Artisan.call('make:interceptor TestInterceptor', false)

    const path = Path.stubs('storage/interceptors/TestInterceptor.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#tests/stubs/storage/interceptors/TestInterceptor'])
    assert.containsSubset(athennaRc.middlewares, ['#tests/stubs/storage/interceptors/TestInterceptor'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: Context) {
    await Artisan.call('make:interceptor TestInterceptor', false)
    await Artisan.call('make:interceptor TestInterceptor', false)

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}
