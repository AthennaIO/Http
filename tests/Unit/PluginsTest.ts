/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Ioc } from '@athenna/ioc'
import { Route } from '../../src/Facades/Route'
import { Server } from '../../src/Facades/Server'
import { TestController } from '../Stubs/TestController'
import { TestMiddleware } from '../Stubs/TestMiddleware'
import { HandleMiddleware } from '../Stubs/HandleMiddleware'
import { InterceptMiddleware } from '../Stubs/InterceptMiddleware'
import { TerminateMiddleware } from '../Stubs/TerminateMiddleware'
import { HttpRouteProvider } from '../../src/Providers/HttpRouteProvider'
import { HttpServerProvider } from '../../src/Providers/HttpServerProvider'
import { BadRequestException } from '../../src/Exceptions/BadRequestException'

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
    new Ioc()
      .reconstruct()
      .singleton('App/Controllers/TestController', TestController)
      .singleton('App/Middlewares/TestMiddleware', TestMiddleware)
      .singleton('App/Middlewares/HandleMiddleware', HandleMiddleware)
      .singleton('App/Middlewares/TerminateMiddleware', TerminateMiddleware)
      .singleton('App/Middlewares/InterceptMiddleware', InterceptMiddleware)

    new HttpServerProvider().register()
    new HttpRouteProvider().boot()
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
  })
})
