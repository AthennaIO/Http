/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, File } from '@athenna/common'
import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class MakeControllerCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAControllerFile({ assert, command }: Context) {
    const output = await command.run('make:controller TestController')

    output.assertSucceeded()
    output.assertLogged('[ MAKING CONTROLLER ]')
    output.assertLogged('[  success  ] Controller "TestController" successfully created.')
    output.assertLogged('[  success  ] Athenna RC updated: [ controllers += "#app/http/controllers/TestController" ]')

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.isTrue(await File.exists(Path.controllers('TestController.ts')))
    assert.containsSubset(athenna.controllers, ['#app/http/controllers/TestController'])
  }

  @Test()
  public async shouldBeAbleToCreateAControllerFileWithADifferentDestPathAndImportPath({ assert, command }: Context) {
    const output = await command.run('make:controller TestController', {
      path: Path.fixtures('consoles/console-mock-dest-import.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING CONTROLLER ]')
    output.assertLogged('[  success  ] Controller "TestController" successfully created.')
    output.assertLogged(
      '[  success  ] Athenna RC updated: [ controllers += "#tests/fixtures/storage/controllers/TestController" ]'
    )

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.isTrue(await File.exists(Path.fixtures('storage/controllers/TestController.ts')))
    assert.containsSubset(athenna.controllers, ['#tests/fixtures/storage/controllers/TestController'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ command }: Context) {
    await command.run('make:controller TestController')
    const output = await command.run('make:controller TestController')

    output.assertFailed()
    output.assertLogged('[ MAKING CONTROLLER ]')
    output.assertLogged('The file')
    output.assertLogged('TestController.ts')
    output.assertLogged('already exists')
  }
}
