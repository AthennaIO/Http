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

export default class MakeTerminatorCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateATerminatorFile({ assert }: TestContext) {
    await Artisan.call('make:terminator TestTerminator', false)

    const path = Path.http('Terminators/TestTerminator.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#app/Http/Terminators/TestTerminator'])
    assert.containsSubset(athennaRc.middlewares, ['#app/Http/Terminators/TestTerminator'])
  }

  @Test()
  public async shouldBeAbleToCreateATerminatorFileWithDifferentDestPath({ assert }: TestContext) {
    Config.set('rc.commands.make:terminator.path', Config.get('rc.commands.make:terminator'))
    Config.set('rc.commands.make:terminator.destination', Path.stubs('storage/terminators'))

    await Artisan.call('make:terminator TestTerminator', false)

    const path = Path.stubs('storage/terminators/TestTerminator.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('package.json')).getContentAsJson().then(json => json.athenna)

    assert.containsSubset(Config.get('rc.middlewares'), ['#tests/Stubs/storage/terminators/TestTerminator'])
    assert.containsSubset(athennaRc.middlewares, ['#tests/Stubs/storage/terminators/TestTerminator'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: TestContext) {
    await Artisan.call('make:terminator TestTerminator', false)
    await Artisan.call('make:terminator TestTerminator', false)

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}
