/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Color } from '@athenna/common'
import { Config } from '@athenna/config'
import { ViewProvider } from '@athenna/view'
import { LoggerProvider } from '@athenna/logger'
import { ExitFaker } from '#tests/Helpers/ExitFaker'
import { Artisan, ConsoleKernel, ArtisanProvider } from '@athenna/artisan'

test.group('RouteListCommandTest', group => {
  const artisan = Path.pwd('bin/artisan.js')

  group.each.setup(async () => {
    ioc.reconstruct()

    ExitFaker.fake()

    process.env.IS_TS = 'true'

    await Config.loadAll(Path.stubs('config'))

    new ViewProvider().register()
    new LoggerProvider().register()
    new ArtisanProvider().register()

    const kernel = new ConsoleKernel()

    await kernel.registerExceptionHandler()
    await kernel.registerCommands(['ts-node', 'artisan', 'route:list'])
  })

  group.each.teardown(async () => {
    ExitFaker.release()
  })

  test('should be able to list all routes registered in the http server', async ({ assert }) => {
    const { stdout } = await Artisan.callInChild('route:list', artisan)

    assert.deepEqual(
      Color.removeColors(stdout),
      '[ LISTING ROUTES ]\n' +
        '\n' +
        '┌───────────┬───────────┬────────────────────────┬─────────┐\n' +
        '│ Methods   │ Route     │ Name                   │ Handler │\n' +
        '├───────────┼───────────┼────────────────────────┼─────────┤\n' +
        '│ GET|HEAD  │ /hello    │ get::hello             │ closure │\n' +
        '├───────────┼───────────┼────────────────────────┼─────────┤\n' +
        '│ POST      │ /hello    │ post::hello            │ closure │\n' +
        '├───────────┼───────────┼────────────────────────┼─────────┤\n' +
        '│ GET       │ /test     │ HelloController.index  │ index   │\n' +
        '├───────────┼───────────┼────────────────────────┼─────────┤\n' +
        '│ POST      │ /test     │ HelloController.store  │ store   │\n' +
        '├───────────┼───────────┼────────────────────────┼─────────┤\n' +
        '│ GET       │ /test/:id │ HelloController.show   │ show    │\n' +
        '├───────────┼───────────┼────────────────────────┼─────────┤\n' +
        '│ PUT|PATCH │ /test/:id │ HelloController.update │ update  │\n' +
        '├───────────┼───────────┼────────────────────────┼─────────┤\n' +
        '│ DELETE    │ /test/:id │ HelloController.delete │ delete  │\n' +
        '└───────────┴───────────┴────────────────────────┴─────────┘\n',
    )
  })

  test('should be able to change the route path using the HTTP_ROUTE_FILE_PATH env variable', async ({ assert }) => {
    process.env.HTTP_ROUTE_FILE_PATH = 'not-found'

    const { stdout } = await Artisan.callInChild('route:list', artisan)

    assert.deepEqual(Color.removeColors(stdout), '[ LISTING ROUTES ]\n\n')
  })
})
