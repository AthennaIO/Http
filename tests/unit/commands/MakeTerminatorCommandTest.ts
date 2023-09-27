/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File } from '@athenna/common'
import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class MakeTerminatorCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateATerminatorFile({ assert, command }: Context) {
    const output = await command.run('make:terminator TestTerminator')

    output.assertSucceeded()
    output.assertLogged('[ MAKING TERMINATOR ]')
    output.assertLogged('[  success  ] Terminator "TestTerminator" successfully created.')
    output.assertLogged('[  success  ] Athenna RC updated: [ middlewares += "#app/http/terminators/TestTerminator" ]')

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.isTrue(await File.exists(Path.terminators('TestTerminator.ts')))
    assert.containsSubset(athenna.middlewares, ['#app/http/terminators/TestTerminator'])
  }

  @Test()
  public async shouldBeAbleToCreateATerminatorFileWithADifferentDestPathAndImportPath({ assert, command }: Context) {
    const output = await command.run('make:terminator TestTerminator', {
      path: Path.fixtures('consoles/console-mock-dest-import.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING TERMINATOR ]')
    output.assertLogged('[  success  ] Terminator "TestTerminator" successfully created.')
    output.assertLogged(
      '[  success  ] Athenna RC updated: [ middlewares += "#tests/fixtures/storage/terminators/TestTerminator" ]'
    )

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.isTrue(await File.exists(Path.fixtures('storage/terminators/TestTerminator.ts')))
    assert.containsSubset(athenna.middlewares, ['#tests/fixtures/storage/terminators/TestTerminator'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ command }: Context) {
    await command.run('make:terminator TestTerminator')
    const output = await command.run('make:terminator TestTerminator')

    output.assertFailed()
    output.assertLogged('[ MAKING TERMINATOR ]')
    output.assertLogged('The file')
    output.assertLogged('TestTerminator.ts')
    output.assertLogged('already exists')
  }
}
