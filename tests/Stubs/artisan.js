import { Artisan } from '@athenna/artisan'
import { Config } from '@athenna/config'
import { Path } from '@athenna/common'
import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'
import { ArtisanProvider } from '@athenna/artisan/providers/ArtisanProvider'

import { Kernel } from '#tests/Stubs/app/Console/Kernel'
import { HttpRouteProvider } from '#src/Providers/HttpRouteProvider'
import { HttpServerProvider } from '#src/Providers/HttpServerProvider'
import { ControllerProvider } from '#src/Providers/ControllerProvider'
import { MiddlewareProvider } from '#src/Providers/MiddlewareProvider'

await Config.safeLoad(Path.config('app.js'))
await Config.safeLoad(Path.config('logging.js'))

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

Artisan.main()
