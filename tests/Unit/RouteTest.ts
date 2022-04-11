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

describe('\n RouteTest', () => {
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

  it('should be able to register a new route', async () => {
    Route.get('test', handler)
    Route.register()

    await Server.listen(3040)

    const response = await Server.request().get('/test')

    expect(response.statusCode).toBe(200)
    expect(response.json()).toStrictEqual({ hello: 'world' })
  })

  it('should be able to register a new route group', async () => {
    Route.group(() => {
      Route.get('test', handler)
      Route.post('test', handler)
    }).prefix('v1')

    Route.register()

    await Server.listen(3041)

    {
      const response = await Server.request().get('/v1/test')

      expect(response.statusCode).toBe(200)
      expect(response.json()).toStrictEqual({ hello: 'world' })
    }
    {
      const response = await Server.request().post('/v1/test')

      expect(response.statusCode).toBe(200)
      expect(response.json()).toStrictEqual({ hello: 'world' })
    }
  })

  it('should be able to register a new route resource', async () => {
    Route.resource('test', new TestController()).only(['store'])
    Route.resource('tests', 'TestController').only(['index', 'show', 'store'])

    Route.register()

    await Server.listen(3042)

    {
      const response = await Server.request().post('/test')

      expect(response.statusCode).toBe(200)
      expect(response.json()).toStrictEqual({ hello: 'world' })
    }
    {
      const response = await Server.request().get('/tests')

      expect(response.statusCode).toBe(200)
      expect(response.json()).toStrictEqual({ hello: 'world' })
    }
    {
      const response = await Server.request().post('/tests')

      expect(response.statusCode).toBe(200)
      expect(response.json()).toStrictEqual({ hello: 'world' })
    }
    {
      const response = await Server.request().get('/tests/1')

      expect(response.statusCode).toBe(200)
      expect(response.json()).toStrictEqual({ hello: 'world' })
    }
  })

  it('should be able to register a new route with middleware', async () => {
    Route.get('test', 'TestController.index')
      .middleware('HandleMiddleware')
      .middleware(ctx => {
        ctx.data.midHandler = true

        ctx.next()
      })

    Route.register()

    await Server.listen(3043)

    const response = await Server.request().get('/test')

    expect(response.statusCode).toBe(200)
    expect(response.json()).toStrictEqual({
      hello: 'world',
      midHandler: true,
      middlewares: ['handle'],
    })
  })

  it('should be able to register a new group with resource inside', async () => {
    Route.group(() => {
      Route.get('test', 'TestController.show').middleware(ctx => {
        ctx.request.queries.throwError = 'true'

        ctx.next()
      })

      Route.patch('test', 'TestController.show').middleware(ctx => {
        ctx.data.midHandler = false
        ctx.data.patchHandler = true

        ctx.next()
      })

      Route.resource('tests', 'TestController')
        .only(['store'])
        .middleware(ctx => {
          ctx.data.rscHandler = true

          ctx.next()
        })
    })
      .prefix('v1')
      .middleware('HandleMiddleware')
      .middleware(ctx => {
        ctx.data.midHandler = true

        ctx.next()
      })

    Route.register()

    await Server.listen(3044)

    {
      const response = await Server.request().get('/v1/test')

      expect(response.statusCode).toBe(400)
      expect(response.json().statusCode).toStrictEqual(400)
      expect(response.json().code).toStrictEqual('BAD_REQUEST_ERROR')
      expect(response.json().error).toStrictEqual('Bad Request')
      expect(response.json().message).toStrictEqual('Testing')
    }
    {
      const response = await Server.request().patch('/v1/test')

      expect(response.statusCode).toBe(200)
      expect(response.json()).toStrictEqual({
        hello: 'world',
        midHandler: true,
        patchHandler: true,
        middlewares: ['handle'],
      })
    }
    {
      const response = await Server.request().post('/v1/tests')

      expect(response.statusCode).toBe(200)
      expect(response.json()).toStrictEqual({
        hello: 'world',
        midHandler: true,
        rscHandler: true,
        middlewares: ['handle'],
      })
    }
  })

  it('should be able to register a new route with intercept middleware', async () => {
    Route.get('testing', 'TestController.index').middleware('HandleMiddleware').middleware('InterceptMiddleware')
    Route.register()

    await Server.listen(3045)

    const response = await Server.request().get('/testing')

    expect(response.statusCode).toBe(200)
    expect(response.json()).toStrictEqual({
      hello: 'world',
      middlewares: ['handle', 'intercept'],
    })
  })

  it('should be able to register a new route with terminate middleware', async () => {
    let terminated = false

    Route.get('test', 'TestController.index').middleware(ctx => {
      terminated = true

      ctx.next()
    }, 'terminate')

    Route.register()

    await Server.listen(3046)

    const response = await Server.request().get('/test')

    expect(response.statusCode).toBe(200)
    expect(terminated).toBe(true)
    expect(response.json()).toStrictEqual({
      hello: 'world',
    })
  })

  it('should be able to register a new route with middleware and controller direct class', async () => {
    let terminated = false

    Route.controller(new TestController())
      .get('test', 'index')
      .middleware(new HandleMiddleware())
      .middleware(ctx => {
        terminated = true

        ctx.next()
      }, 'terminate')

    Route.register()

    await Server.listen(3047)

    const response = await Server.request().get('/test')

    expect(response.statusCode).toBe(200)
    expect(terminated).toBe(true)
    expect(response.json()).toStrictEqual({
      hello: 'world',
      middlewares: ['handle'],
    })
  })

  it('should be able to register a new route with middleware direct class on groups', async () => {
    let terminated = false

    Route.controller(new TestController())
      .group(() => {
        Route.get('test', 'index')
      })
      .prefix('api/v1')
      .middleware(new HandleMiddleware())
      .middleware(ctx => {
        terminated = true

        ctx.next()
      }, 'terminate')

    Route.register()

    await Server.listen(3048)

    const response = await Server.request().get('/api/v1/test')

    expect(response.statusCode).toBe(200)
    expect(terminated).toBe(true)
    expect(response.json()).toStrictEqual({
      hello: 'world',
      middlewares: ['handle'],
    })
  })

  afterEach(async () => {
    await Server.close()
  })
})
