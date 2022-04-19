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
import { Kernel } from 'tests/Stubs/app/Http/Kernel'
import { HttpRouteProvider } from 'src/Providers/HttpRouteProvider'
import { HttpServerProvider } from 'src/Providers/HttpServerProvider'
import { BadRequestException } from 'src/Exceptions/BadRequestException'

describe('\n KernelTest', () => {
  const handler = async ctx => {
    const data: any = { hello: 'world' }

    if (ctx.data.param) data.param = ctx.data.param
    if (ctx.data.midHandler) data.midHandler = ctx.data.midHandler
    if (ctx.request.queries.test) data.test = ctx.request.query('test')
    if (ctx.request.queries.throwError) throw new BadRequestException('Testing')

    ctx.response.status(200).send(data)
  }

  beforeEach(async () => {
    new HttpServerProvider().register()
    new HttpRouteProvider().boot()
  })

  it('should be able to instantiate a new http kernel and register middlewares', async () => {
    await new Kernel().registerCors()
    await new Kernel().registerRateLimit()
    await new Kernel().registerErrorHandler()
    await new Kernel().registerLogMiddleware()
    await new Kernel().registerMiddlewares()

    Route.get('test', handler).middleware('intercept')
    Route.register()

    await Server.listen(3040)

    const response = await Server.request().get('/test')

    expect(response.statusCode).toBe(200)
    expect(response.json()).toStrictEqual({
      hello: 'world',
      param: 'param',
      test: 'middleware',
      middlewares: ['intercept'],
    })
  })

  afterEach(async () => {
    await Server.close()
  })
})
