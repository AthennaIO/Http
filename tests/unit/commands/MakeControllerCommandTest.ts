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

export default class MakeControllerCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAControllerFile({ assert }: Context) {
    await Artisan.call('make:controller TestController', false)

    const path = Path.controllers('TestController.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.controllers'), ['#app/http/controllers/TestController'])
    assert.containsSubset(athennaRc.controllers, ['#app/http/controllers/TestController'])
  }

  @Test()
  public async shouldBeAbleToCreateAControllerFileWithDifferentDestPath({ assert }: Context) {
    Config.set('rc.commands.make:controller.path', Config.get('rc.commands.make:controller'))
    Config.set('rc.commands.make:controller.destination', Path.stubs('storage/controllers'))

    await Artisan.call('make:controller TestController', false)

    const path = Path.stubs('storage/controllers/TestController.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.controllers'), ['#tests/stubs/storage/controllers/TestController'])
    assert.containsSubset(athennaRc.controllers, ['#tests/stubs/storage/controllers/TestController'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: Context) {
    await Artisan.call('make:controller TestController', false)
    await Artisan.call('make:controller TestController', false)

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}
