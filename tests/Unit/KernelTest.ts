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
import { Folder, Path } from '@secjs/utils'
import { Kernel } from 'tests/Stubs/app/Http/Kernel'
import { HttpRouteProvider } from 'src/Providers/HttpRouteProvider'
import { HttpServerProvider } from 'src/Providers/HttpServerProvider'
import { BadRequestException } from 'src/Exceptions/BadRequestException'

describe('\n KernelTest', () => {
  const handler = async ctx => {
    const data: any = { hello: 'world' }

    if (ctx.data.param) data.param = ctx.data.param
    if (ctx.data.requestId) data.requestId = ctx.data.requestId
    if (ctx.data.midHandler) data.midHandler = ctx.data.midHandler
    if (ctx.request.queries.test) data.test = ctx.request.query('test')
    if (ctx.request.queries.throwError) throw new BadRequestException('Testing')

    ctx.response.status(200).send(data)
  }

  beforeEach(async () => {
    await new Folder(Path.tests('Stubs/app')).loadSync().copy(Path.app())
    await new Folder(Path.tests('Stubs/app/Http')).loadSync().copy(Path.app('Http'))
    await new Folder(Path.tests('Stubs/app/Http/Exceptions')).loadSync().copy(Path.app('Http/Exceptions'))

    new HttpServerProvider().register()
    new HttpRouteProvider().boot()
  })

  it('should be able to instantiate a new http kernel and register middlewares', async () => {
    await new Kernel().registerCors()
    await new Kernel().registerRateLimit()
    await new Kernel().registerMiddlewares()
    await new Kernel().registerErrorHandler()
    await new Kernel().registerLogMiddleware()
    await new Kernel().registerRequestIdMiddleware()

    Route.get('test', handler).middleware('intercept')
    Route.register()

    await Server.listen(3040)

    const response = await Server.request().get('/test')

    expect(response.statusCode).toBe(200)
    expect(response.json().requestId).toBeTruthy()
    expect(response.json().hello).toBe('world')
    expect(response.json().test).toBe('middleware')
    expect(response.json().middlewares).toStrictEqual(['intercept'])
  })

  afterEach(async () => {
    await Folder.safeRemove(Path.app())

    await Server.close()
  })
})
