/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Config } from '@athenna/config'
import { ViewProvider } from '@athenna/view'
import { File, Folder } from '@athenna/common'
import { LoggerProvider } from '@athenna/logger'
import { ExitFaker } from '#tests/Helpers/ExitFaker'
import { Artisan, ConsoleKernel, ArtisanProvider } from '@athenna/artisan'

test.group('MakeInterceptorCommandTest', group => {
  const originalRcJson = new File(Path.pwd('.athennarc.json')).getContentSync().toString()

  group.each.setup(async () => {
    ExitFaker.fake()

    process.env.IS_TS = 'true'

    await Config.loadAll(Path.stubs('config'))

    new ViewProvider().register()
    new LoggerProvider().register()
    new ArtisanProvider().register()

    const kernel = new ConsoleKernel()

    await kernel.registerExceptionHandler()
    await kernel.registerCommands(['ts-node', 'artisan', 'make:interceptor'])
  })

  group.each.teardown(async () => {
    ExitFaker.release()

    await Folder.safeRemove(Path.app())

    const stream = new File(Path.pwd('.athennarc.json')).createWriteStream()

    await new Promise((resolve, reject) => {
      stream.write(originalRcJson)
      stream.end(resolve)
      stream.on('error', reject)
    })
  })

  test('should be able to create a interceptor file', async ({ assert }) => {
    await Artisan.call('make:interceptor TestInterceptor')

    const path = Path.http('Interceptors/TestInterceptor.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledWith(0))

    const athennaRc = await new File(Path.pwd('.athennarc.json'))
      .getContent()
      .then(content => JSON.parse(content.toString()))

    assert.containsSubset(Config.get('rc.middlewares'), ['#app/Http/Interceptors/TestInterceptor'])
    assert.containsSubset(athennaRc.middlewares, ['#app/Http/Interceptors/TestInterceptor'])
  })

  test('should throw an exception when the file already exists', async ({ assert }) => {
    await Artisan.call('make:interceptor TestInterceptor')
    await Artisan.call('make:interceptor TestInterceptor')

    assert.isTrue(ExitFaker.faker.calledWith(1))
  })
})