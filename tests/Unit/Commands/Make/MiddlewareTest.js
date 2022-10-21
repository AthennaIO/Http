/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Artisan } from '@athenna/artisan'
import { Config } from '@athenna/config'
import { File, Folder, Path } from '@athenna/common'

import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'
import { ArtisanProvider } from '@athenna/artisan/providers/ArtisanProvider'

import { Kernel } from '#tests/Stubs/app/Console/Kernel'

test.group('MakeControllerTest', group => {
  group.each.setup(async () => {
    await new Folder(Path.stubs('app')).copy(Path.app())
    await new Folder(Path.stubs('config')).copy(Path.config())

    await Config.safeLoad(Path.config('app.js'))
    await Config.safeLoad(Path.config('logging.js'))

    new LoggerProvider().register()
    new ArtisanProvider().register()

    const kernel = new Kernel()

    await kernel.registerErrorHandler()
    await kernel.registerCommands()
    await kernel.registerTemplates()
  })

  group.each.teardown(async () => {
    await Folder.safeRemove(Path.app())
    await Folder.safeRemove(Path.config())
  })

  test('should be able to create a middleware file', async ({ assert }) => {
    await Artisan.call('make:middleware OtherMiddleware --no-register')

    const path = Path.http('Middlewares/OtherMiddleware.js')

    assert.isTrue(await File.exists(path))
  }).timeout(60000)

  test('should be able to create a middleware file and register it inside http kernel', async ({ assert }) => {
    const oldKernelLength = new File(Path.http('Kernel.js')).getContentSync().toString().length

    await Artisan.call('make:middleware OtherMiddleware')

    const newKernelLength = new File(Path.http('Kernel.js')).getContentSync().toString().length

    assert.notEqual(newKernelLength, oldKernelLength)
  }).timeout(60000)

  test('should throw an error when the file already exists', async ({ assert }) => {
    await Artisan.call('make:middleware other')
    await Artisan.call('make:middleware other')
  }).timeout(60000)
})
