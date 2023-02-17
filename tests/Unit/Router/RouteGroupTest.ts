/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Route } from '#src/Facades/Route'
import { Server } from '#src/Facades/Server'
import { Middleware } from '#tests/Stubs/middlewares/Middleware'
import { Terminator } from '#tests/Stubs/middlewares/Terminator'
import { Interceptor } from '#tests/Stubs/middlewares/Interceptor'
import { HttpRouteProvider } from '#src/Providers/HttpRouteProvider'
import { HttpServerProvider } from '#src/Providers/HttpServerProvider'

test.group('RouteGroupTest', group => {
  group.each.setup(async () => {
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
})
