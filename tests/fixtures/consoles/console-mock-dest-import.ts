/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { sep } from 'node:path'
import { Config, Rc } from '@athenna/config'
import { ViewProvider } from '@athenna/view'
import { LoggerProvider } from '@athenna/logger'
import { Artisan, ArtisanProvider, ConsoleKernel } from '@athenna/artisan'

process.env.IS_TS = 'true'

await Config.loadAll(Path.fixtures('config'))

Config.set('rc.meta', Path.toHref(Path.pwd() + sep))

Config.set('rc.commands', {
  'route:list': {
    path: '#src/commands/RouteListCommand',
    route: './tests/fixtures/routes/http.js',
    kernel: './tests/fixtures/kernels/HttpKernel.js'
  },
  'make:controller': {
    path: '#src/commands/MakeControllerCommand',
    destination: './tests/fixtures/storage/controllers'
  },
  'make:interceptor': {
    path: '#src/commands/MakeInterceptorCommand',
    destination: './tests/fixtures/storage/interceptors'
  },
  'make:middleware': {
    path: '#src/commands/MakeMiddlewareCommand',
    destination: './tests/fixtures/storage/middlewares'
  },
  'make:terminator': {
    path: '#src/commands/MakeTerminatorCommand',
    destination: './tests/fixtures/storage/terminators'
  }
})

await Rc.setFile(Path.pwd('package.json'))

new ViewProvider().register()
new ArtisanProvider().register()
new LoggerProvider().register()

await new ConsoleKernel().registerCommands(process.argv)

await Artisan.parse(process.argv, 'Artisan')
