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

export default class MakeInterceptorCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAInterceptorFile({ assert, command }: Context) {
    const output = await command.run('make:interceptor TestInterceptor')

    output.assertSucceeded()
    output.assertLogged('[ MAKING INTERCEPTOR ]')
    output.assertLogged('[  success  ] Interceptor "TestInterceptor" successfully created.')
    output.assertLogged('[  success  ] Athenna RC updated: [ middlewares += "#app/http/interceptors/TestInterceptor" ]')

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.isTrue(await File.exists(Path.interceptors('TestInterceptor.ts')))
    assert.containsSubset(athenna.middlewares, ['#app/http/interceptors/TestInterceptor'])
  }

  @Test()
  public async shouldBeAbleToCreateAInterceptorFileWithADifferentDestPathAndImportPath({ assert, command }: Context) {
    const output = await command.run('make:interceptor TestInterceptor', {
      path: Path.fixtures('consoles/console-mock-dest-import.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING INTERCEPTOR ]')
    output.assertLogged('[  success  ] Interceptor "TestInterceptor" successfully created.')
    output.assertLogged(
      '[  success  ] Athenna RC updated: [ middlewares += "#tests/fixtures/storage/interceptors/TestInterceptor" ]'
    )

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.isTrue(await File.exists(Path.fixtures('storage/interceptors/TestInterceptor.ts')))
    assert.containsSubset(athenna.middlewares, ['#tests/fixtures/storage/interceptors/TestInterceptor'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ command }: Context) {
    await command.run('make:interceptor TestInterceptor')
    const output = await command.run('make:interceptor TestInterceptor')

    output.assertFailed()
    output.assertLogged('[ MAKING INTERCEPTOR ]')
    output.assertLogged('The file')
    output.assertLogged('TestInterceptor.ts')
    output.assertLogged('already exists')
  }
}
