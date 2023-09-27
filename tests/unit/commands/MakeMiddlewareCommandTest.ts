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

export default class MakeMiddlewareCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAMiddlewareFile({ assert, command }: Context) {
    const output = await command.run('make:middleware TestMiddleware')

    output.assertSucceeded()
    output.assertLogged('[ MAKING MIDDLEWARE ]')
    output.assertLogged('[  success  ] Middleware "TestMiddleware" successfully created.')
    output.assertLogged('[  success  ] Athenna RC updated: [ middlewares += "#app/http/middlewares/TestMiddleware" ]')

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.isTrue(await File.exists(Path.middlewares('TestMiddleware.ts')))
    assert.containsSubset(athenna.middlewares, ['#app/http/middlewares/TestMiddleware'])
  }

  @Test()
  public async shouldBeAbleToCreateAMiddlewareFileWithADifferentDestPathAndImportPath({ assert, command }: Context) {
    const output = await command.run('make:middleware TestMiddleware', {
      path: Path.fixtures('consoles/console-mock-dest-import.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING MIDDLEWARE ]')
    output.assertLogged('[  success  ] Middleware "TestMiddleware" successfully created.')
    output.assertLogged(
      '[  success  ] Athenna RC updated: [ middlewares += "#tests/fixtures/storage/middlewares/TestMiddleware" ]'
    )

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.isTrue(await File.exists(Path.fixtures('storage/middlewares/TestMiddleware.ts')))
    assert.containsSubset(athenna.middlewares, ['#tests/fixtures/storage/middlewares/TestMiddleware'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ command }: Context) {
    await command.run('make:middleware TestMiddleware')
    const output = await command.run('make:middleware TestMiddleware')

    output.assertFailed()
    output.assertLogged('[ MAKING MIDDLEWARE ]')
    output.assertLogged('The file')
    output.assertLogged('TestMiddleware.ts')
    output.assertLogged('already exists')
  }
}
