/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { sep } from 'node:path'
import { Path } from '@athenna/common'
import { Config, Rc } from '@athenna/config'
import { ViewProvider } from '@athenna/view'
import { LoggerProvider } from '@athenna/logger'
import { Artisan, ArtisanProvider, ConsoleKernel } from '@athenna/artisan'

process.env.IS_TS = 'true'

await Config.loadAll(Path.fixtures('config'))

Config.set('rc.parentURL', Path.toHref(Path.pwd() + sep))

Config.set('rc.http', {
  route: './tests/fixtures/routes/http.js',
  kernel: './tests/fixtures/kernels/HttpKernel.js'
})

Config.set('rc.commands', {
  'route:list': '#src/commands/RouteListCommand',
  'make:controller': '#src/commands/MakeControllerCommand',
  'make:interceptor': '#src/commands/MakeInterceptorCommand',
  'make:middleware': '#src/commands/MakeMiddlewareCommand',
  'make:terminator': '#src/commands/MakeTerminatorCommand'
})

await Rc.setFile(Path.pwd('package.json'))

new ViewProvider().register()
new ArtisanProvider().register()
new LoggerProvider().register()

await new ConsoleKernel().registerCommands(process.argv)

await Artisan.parse(process.argv, 'Artisan')
