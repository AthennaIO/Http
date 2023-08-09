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

export default class MakeTerminatorCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateATerminatorFile({ assert }: Context) {
    await Artisan.call('make:terminator TestTerminator', false)

    const path = Path.terminators('TestTerminator.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#app/http/terminators/TestTerminator'])
    assert.containsSubset(athennaRc.middlewares, ['#app/http/terminators/TestTerminator'])
  }

  @Test()
  public async shouldBeAbleToCreateATerminatorFileWithDifferentDestPath({ assert }: Context) {
    Config.set('rc.commands.make:terminator.path', Config.get('rc.commands.make:terminator'))
    Config.set('rc.commands.make:terminator.destination', Path.stubs('storage/terminators'))

    await Artisan.call('make:terminator TestTerminator', false)

    const path = Path.stubs('storage/terminators/TestTerminator.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#tests/stubs/storage/terminators/TestTerminator'])
    assert.containsSubset(athennaRc.middlewares, ['#tests/stubs/storage/terminators/TestTerminator'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: Context) {
    await Artisan.call('make:terminator TestTerminator', false)
    await Artisan.call('make:terminator TestTerminator', false)

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}
