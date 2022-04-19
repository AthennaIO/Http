/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Route } from 'src/Facades/Route'
import { Server } from 'src/Facades/Server'
import { File, Folder, Path } from '@secjs/utils'
import { HttpRouteProvider } from 'src/Providers/HttpRouteProvider'
import { HttpServerProvider } from 'src/Providers/HttpServerProvider'
import { ControllerProvider } from 'src/Providers/ControllerProvider'
import { MiddlewareProvider } from 'src/Providers/MiddlewareProvider'
import { BadRequestException } from 'src/Exceptions/BadRequestException'

describe('\n PluginsTest', () => {
  const handler = async ctx => {
    const data: any = { hello: 'world' }

    if (ctx.data.param) data.param = ctx.data.param
    if (ctx.data.midHandler) data.midHandler = ctx.data.midHandler
    if (ctx.request.queries.test) data.test = ctx.request.query('test')
    if (ctx.request.queries.throwError) throw new BadRequestException('Testing')

    ctx.response.status(200).send(data)
  }

  beforeEach(async () => {
    await new File(Path.tests('Stubs/app/Http/Kernel.ts')).loadSync().copySync(Path.app('Http/Kernel.ts'))
    await new Folder(Path.tests('Stubs/app/Http/Controllers')).loadSync().copySync(Path.app('Http/Controllers'))
    await new Folder(Path.tests('Stubs/app/Http/Middlewares')).loadSync().copySync(Path.app('Http/Middlewares'))

    new HttpServerProvider().register()
    new HttpRouteProvider().boot()
    await new ControllerProvider().boot()
    await new MiddlewareProvider().boot()
  })

  it('should be able to register cors plugin to the server', async () => {
    Server.registerCors()

    Route.get('test', handler)
    Route.register()

    await Server.listen(3040)

    const response = await Server.request().get('/test')

    expect(response.statusCode).toBe(200)
    expect(response.json()).toStrictEqual({ hello: 'world' })
    expect(response.headers['access-control-allow-origin']).toBe('*')
  })

  it('should be able to register rate limit plugin to the server', async () => {
    Server.registerRateLimit()

    Route.get('test', handler)
    Route.register()

    await Server.listen(3040)

    const response = await Server.request().get('/test')

    expect(response.statusCode).toBe(200)
    expect(response.headers['x-ratelimit-limit']).toBe(1000)
    expect(response.headers['x-ratelimit-remaining']).toBe(999)
    expect(response.headers['x-ratelimit-reset']).toBe(60)
    expect(response.json()).toStrictEqual({ hello: 'world' })
  })

  afterEach(async () => {
    await Server.close()
    await Folder.safeRemove(Path.app())
  })
})
