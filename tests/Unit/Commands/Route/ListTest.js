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
import { Config, Folder, Path } from '@secjs/utils'

import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'
import { ArtisanProvider } from '@athenna/artisan/providers/ArtisanProvider'

import { Kernel } from '#tests/Stubs/app/Console/Kernel'
import { HttpServerProvider } from '#src/Providers/HttpServerProvider'
import { HttpRouteProvider } from '#src/Providers/HttpRouteProvider'
import { ControllerProvider } from '#src/Providers/ControllerProvider'
import { MiddlewareProvider } from '#src/Providers/MiddlewareProvider'

test.group('MakeControllerTest', group => {
  group.each.setup(async () => {
    await new Folder(Path.stubs('app')).copy(Path.app())
    await new Folder(Path.stubs('routes')).copy(Path.routes())
    await new Folder(Path.stubs('config')).copy(Path.config())

    await new Config().safeLoad(Path.config('app.js'))
    await new Config().safeLoad(Path.config('http.js'))
    await new Config().safeLoad(Path.config('logging.js'))

    new LoggerProvider().register()
    new ArtisanProvider().register()
    new HttpServerProvider().register()
    new HttpRouteProvider().boot()
    await new ControllerProvider().boot()
    await new MiddlewareProvider().boot()

    const kernel = new Kernel()

    await kernel.registerErrorHandler()
    await kernel.registerCommands()
    await kernel.registerTemplates()
  })

  group.each.teardown(async () => {
    await Folder.safeRemove(Path.app())
    await Folder.safeRemove(Path.routes())
    await Folder.safeRemove(Path.config())
  })

  test('should be able to list all application routes', async ({ assert }) => {
    await Artisan.call('route:list')
  }).timeout(60000)
})
