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
import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class MakeInterceptorCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAInterceptorFile({ assert }: Context) {
    await Artisan.call('make:interceptor TestInterceptor', false)

    const path = Path.interceptors('TestInterceptor.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(this.processExit.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#app/http/interceptors/TestInterceptor'])
    assert.containsSubset(athennaRc.middlewares, ['#app/http/interceptors/TestInterceptor'])
  }

  @Test()
  public async shouldBeAbleToCreateAInterceptorFileWithDifferentDestPath({ assert }: Context) {
    Config.set('rc.commands.make:interceptor.path', Config.get('rc.commands.make:interceptor'))
    Config.set('rc.commands.make:interceptor.destination', Path.fixtures('storage/interceptors'))

    await Artisan.call('make:interceptor TestInterceptor', false)

    const path = Path.fixtures('storage/interceptors/TestInterceptor.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(this.processExit.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#tests/fixtures/storage/interceptors/TestInterceptor'])
    assert.containsSubset(athennaRc.middlewares, ['#tests/fixtures/storage/interceptors/TestInterceptor'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: Context) {
    await Artisan.call('make:interceptor TestInterceptor', false)
    await Artisan.call('make:interceptor TestInterceptor', false)

    assert.isTrue(this.processExit.calledWith(1))
  }
}
