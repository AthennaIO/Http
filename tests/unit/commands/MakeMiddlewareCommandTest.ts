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

export default class MakeMiddlewareCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAMiddlewareFile({ assert }: Context) {
    await Artisan.call('make:middleware TestMiddleware', false)

    const path = Path.middlewares('TestMiddleware.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(this.processExit.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#app/http/middlewares/TestMiddleware'])
    assert.containsSubset(athennaRc.middlewares, ['#app/http/middlewares/TestMiddleware'])
  }

  @Test()
  public async shouldBeAbleToCreateAMiddlewareFileWithDifferentDestPath({ assert }: Context) {
    Config.set('rc.commands.make:middleware.path', Config.get('rc.commands.make:middleware'))
    Config.set('rc.commands.make:middleware.destination', Path.fixtures('storage/middlewares'))

    await Artisan.call('make:middleware TestMiddleware', false)

    const path = Path.fixtures('storage/middlewares/TestMiddleware.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(this.processExit.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#tests/fixtures/storage/middlewares/TestMiddleware'])
    assert.containsSubset(athennaRc.middlewares, ['#tests/fixtures/storage/middlewares/TestMiddleware'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: Context) {
    await Artisan.call('make:middleware TestMiddleware', false)
    await Artisan.call('make:middleware TestMiddleware', false)

    assert.isTrue(this.processExit.calledWith(1))
  }
}
