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

export default class MakeMiddlewareCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAMiddlewareFile({ assert }: TestContext) {
    await Artisan.call('make:middleware TestMiddleware', false)

    const path = Path.http('Middlewares/TestMiddleware.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#app/Http/Middlewares/TestMiddleware'])
    assert.containsSubset(athennaRc.middlewares, ['#app/Http/Middlewares/TestMiddleware'])
  }

  @Test()
  public async shouldBeAbleToCreateAMiddlewareFileWithDifferentDestPath({ assert }: TestContext) {
    Config.set('rc.commands.make:middleware.path', Config.get('rc.commands.make:middleware'))
    Config.set('rc.commands.make:middleware.destination', Path.stubs('storage/middlewares'))

    await Artisan.call('make:middleware TestMiddleware', false)

    const path = Path.stubs('storage/middlewares/TestMiddleware.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#tests/Stubs/storage/middlewares/TestMiddleware'])
    assert.containsSubset(athennaRc.middlewares, ['#tests/Stubs/storage/middlewares/TestMiddleware'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: TestContext) {
    await Artisan.call('make:middleware TestMiddleware', false)
    await Artisan.call('make:middleware TestMiddleware', false)

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}
