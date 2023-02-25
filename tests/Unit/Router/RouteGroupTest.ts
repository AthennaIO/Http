/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Middleware } from '#tests/Stubs/middlewares/Middleware'
import { Terminator } from '#tests/Stubs/middlewares/Terminator'
import { Interceptor } from '#tests/Stubs/middlewares/Interceptor'
import { Route, Server, HttpRouteProvider, HttpServerProvider } from '#src'

test.group('RouteGroupTest', group => {
  group.each.setup(async () => {
    ioc.reconstruct()

    new HttpServerProvider().register()
    new HttpRouteProvider().register()
  })

  group.each.teardown(async () => {
    await new HttpServerProvider().shutdown()
  })

  test('should be able to create a route group using route class', async ({ assert }) => {
    Route.group(() => {
      Route.get('/test', ctx => ctx.response.send({ hello: 'world' }))
    }).prefix('/v1')

    Route.register()

    const response = await Server.request({ path: '/v1/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to create a route group inside other route group using route class', async ({ assert }) => {
    Route.group(() => {
      Route.group(() => {
        Route.get('/test', ctx => ctx.response.send({ hello: 'world' }))
      }).prefix('/v1')
    }).prefix('/api')

    Route.register()

    const response = await Server.request({ path: '/api/v1/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to create a route group that adds helmet options using route class', async ({ assert }) => {
    await Server.plugin(import('@fastify/helmet'), { global: false })

    Route.group(() => {
      Route.get('/test', ctx => ctx.response.send({ hello: 'world' }))
    })
      .prefix('/v1')
      .helmet({
        dnsPrefetchControl: { allow: true },
      })

    Route.register()

    const response = await Server.request({ path: '/v1/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
    assert.deepEqual(
      response.headers['content-security-policy'],
      "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
    )
  })

  test('should be able to create a route group that adds rate limit options using route class', async ({ assert }) => {
    await Server.plugin(import('@fastify/rate-limit'))

    Route.group(() => {
      Route.get('/test', ctx => ctx.response.send({ hello: 'world' }))
    })
      .prefix('/v1')
      .rateLimit({
        max: 100,
        timeWindow: '1 minute',
      })

    Route.register()

    const response = await Server.request({ path: '/v1/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
    assert.deepEqual(response.headers['x-ratelimit-limit'], 100)
    assert.deepEqual(response.headers['x-ratelimit-remaining'], 99)
    assert.deepEqual(response.headers['x-ratelimit-reset'], 60)
  })

  test('should be able to register a middleware closure in route group using router', async ({ assert }) => {
    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).middleware(ctx => (ctx.data.handled = true))

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  })

  test('should be able to register an intercept middleware closure in route group using router', async ({ assert }) => {
    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).interceptor(ctx => {
      ctx.body.intercepted = true

      return ctx.body
    })

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true,
    })
  })

  test('should be able to register a terminate middleware closure in route group using router', async ({ assert }) => {
    let terminated = false

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).terminator(() => {
      terminated = true
    })

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
    assert.isTrue(terminated)
  })

  test('should be able to register a middleware class in route group using router', async ({ assert }) => {
    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).middleware(new Middleware())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  })

  test('should be able to register an intercept middleware class in route group using router', async ({ assert }) => {
    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).interceptor(new Interceptor())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true,
    })
  })

  test('should be able to register a terminate middleware class in route group using router', async ({ assert }) => {
    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).terminator(new Terminator())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
  })

  test('should be able to register a middleware dependency in route group using router', async ({ assert }) => {
    ioc.bind('App/Http/Middlewares/Middleware', Middleware)

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).middleware('Middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  })

  test('should be able to register an intercept middleware depedency in route group using router', async ({
    assert,
  }) => {
    ioc.bind('App/Http/Interceptors/Interceptor', Interceptor)

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).interceptor('Interceptor')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true,
    })
  })

  test('should be able to register a terminate middleware dependency in route group using router', async ({
    assert,
  }) => {
    ioc.bind('App/Http/Terminators/Terminator', Terminator)

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).terminator('Terminator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
  })

  test('should be able to register a named middleware in route group using router', async ({ assert }) => {
    ioc.bind('App/Http/Middlewares/Names/middleware', Middleware)

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).middleware('middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  })

  test('should be able to register an intercept named middleware in route group using router', async ({ assert }) => {
    ioc.bind('App/Http/Interceptors/Names/interceptor', Interceptor)

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).interceptor('interceptor')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true,
    })
  })

  test('should be able to register a terminate named middleware in route group using router', async ({ assert }) => {
    ioc.bind('App/Http/Terminators/Names/terminator', Terminator)

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).terminator('terminator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
  })

  test('should throw an exception when middleware name and dependency does not exist', async ({ assert }) => {
    assert.throws(() => Route.group(() => Route.get('test', () => {})).middleware('not-found'))
  })

  test('should throw an exception when interceptor middleware name and dependency does not exist', async ({
    assert,
  }) => {
    assert.throws(() => Route.group(() => Route.get('test', () => {})).interceptor('not-found'))
  })

  test('should throw an exception when terminator middleware name and dependency does not exist', async ({
    assert,
  }) => {
    assert.throws(() => Route.group(() => Route.get('test', () => {})).terminator('not-found'))
  })
})
