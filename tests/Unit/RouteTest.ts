/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Ioc } from '@athenna/ioc'
import { Http } from '../../src/Http'
import { Router } from '../../src/Router/Router'
import { TestController } from '../Stubs/TestController'
import { TestMiddleware } from '../Stubs/TestMiddleware'
import { HandleMiddleware } from '../Stubs/HandleMiddleware'
import { InterceptMiddleware } from '../Stubs/InterceptMiddleware'
import { TerminateMiddleware } from '../Stubs/TerminateMiddleware'
import { HttpRouteProvider } from '../../src/Providers/HttpRouteProvider'
import { HttpServerProvider } from '../../src/Providers/HttpServerProvider'
import { BadRequestException } from '../../src/Exceptions/BadRequestException'

describe('\n RouteTest', () => {
  let http: Http
  let router: Router

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

    http = ioc.safeUse('Athenna/Core/HttpServer')
    router = ioc.safeUse('Athenna/Core/HttpRoute')
  })

  it('should be able to register a new route', async () => {
    router.get('test', handler)
    router.register()

    await http.listen(3040)

    const response = await http.request().get('/test')

    expect(response.statusCode).toBe(200)
    expect(response.json()).toStrictEqual({ hello: 'world' })
  })

  it('should be able to register a new route group', async () => {
    router
      .group(() => {
        router.get('test', handler)
        router.post('test', handler)
      })
      .prefix('v1')

    router.register()

    await http.listen(3041)

    {
      const response = await http.request().get('/v1/test')

      expect(response.statusCode).toBe(200)
      expect(response.json()).toStrictEqual({ hello: 'world' })
    }
    {
      const response = await http.request().post('/v1/test')

      expect(response.statusCode).toBe(200)
      expect(response.json()).toStrictEqual({ hello: 'world' })
    }
  })

  it('should be able to register a new route resource', async () => {
    router.resource('test', new TestController()).only(['store'])
    router.resource('tests', 'TestController').only(['index', 'show', 'store'])

    router.register()

    await http.listen(3042)

    {
      const response = await http.request().post('/test')

      expect(response.statusCode).toBe(200)
      expect(response.json()).toStrictEqual({ hello: 'world' })
    }
    {
      const response = await http.request().get('/tests')

      expect(response.statusCode).toBe(200)
      expect(response.json()).toStrictEqual({ hello: 'world' })
    }
    {
      const response = await http.request().post('/tests')

      expect(response.statusCode).toBe(200)
      expect(response.json()).toStrictEqual({ hello: 'world' })
    }
    {
      const response = await http.request().get('/tests/1')

      expect(response.statusCode).toBe(200)
      expect(response.json()).toStrictEqual({ hello: 'world' })
    }
  })

  it('should be able to register a new route with middleware', async () => {
    router
      .get('test', 'TestController.index')
      .middleware('HandleMiddleware')
      .middleware(ctx => {
        ctx.data.midHandler = true

        ctx.next()
      })

    router.register()

    await http.listen(3043)

    const response = await http.request().get('/test')

    expect(response.statusCode).toBe(200)
    expect(response.json()).toStrictEqual({
      hello: 'world',
      midHandler: true,
      middlewares: ['handle'],
    })
  })

  it('should be able to register a new group with resource inside', async () => {
    router
      .group(() => {
        router.get('test', 'TestController.show').middleware(ctx => {
          ctx.request.queries.throwError = 'true'

          ctx.next()
        })

        router.patch('test', 'TestController.show').middleware(ctx => {
          ctx.data.midHandler = false
          ctx.data.patchHandler = true

          ctx.next()
        })

        router
          .resource('tests', 'TestController')
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

    router.register()

    await http.listen(3044)

    {
      const response = await http.request().get('/v1/test')

      expect(response.statusCode).toBe(400)
      expect(response.json().statusCode).toStrictEqual(400)
      expect(response.json().code).toStrictEqual('BAD_REQUEST_ERROR')
      expect(response.json().error).toStrictEqual('Bad Request')
      expect(response.json().message).toStrictEqual('Testing')
    }
    {
      const response = await http.request().patch('/v1/test')

      expect(response.statusCode).toBe(200)
      expect(response.json()).toStrictEqual({
        hello: 'world',
        midHandler: true,
        patchHandler: true,
        middlewares: ['handle'],
      })
    }
    {
      const response = await http.request().post('/v1/tests')

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
    router.get('testing', 'TestController.index').middleware('HandleMiddleware').middleware('InterceptMiddleware')
    router.register()

    await http.listen(3045)

    const response = await http.request().get('/testing')

    expect(response.statusCode).toBe(200)
    expect(response.json()).toStrictEqual({
      hello: 'world',
      middlewares: ['handle', 'intercept'],
    })
  })

  it('should be able to register a new route with terminate middleware', async () => {
    let terminated = false

    router.get('test', 'TestController.index').middleware(ctx => {
      terminated = true

      ctx.next()
    }, 'terminate')

    router.register()

    await http.listen(3046)

    const response = await http.request().get('/test')

    expect(response.statusCode).toBe(200)
    expect(terminated).toBe(true)
    expect(response.json()).toStrictEqual({
      hello: 'world',
    })
  })

  it('should be able to register a new route with middleware and controller direct class', async () => {
    let terminated = false

    router
      .controller(new TestController())
      .get('test', 'index')
      .middleware(new HandleMiddleware())
      .middleware(ctx => {
        terminated = true

        ctx.next()
      }, 'terminate')

    router.register()

    await http.listen(3047)

    const response = await http.request().get('/test')

    expect(response.statusCode).toBe(200)
    expect(terminated).toBe(true)
    expect(response.json()).toStrictEqual({
      hello: 'world',
      middlewares: ['handle'],
    })
  })

  it('should be able to register a new route with middleware direct class on groups', async () => {
    let terminated = false

    router
      .controller(new TestController())
      .group(() => {
        router.get('test', 'index')
      })
      .prefix('api/v1')
      .middleware(new HandleMiddleware())
      .middleware(ctx => {
        terminated = true

        ctx.next()
      }, 'terminate')

    router.register()

    await http.listen(3048)

    const response = await http.request().get('/api/v1/test')

    expect(response.statusCode).toBe(200)
    expect(terminated).toBe(true)
    expect(response.json()).toStrictEqual({
      hello: 'world',
      middlewares: ['handle'],
    })
  })

  afterEach(async () => {
    await http.close()
  })
})
