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
import { HttpRouteProvider } from '#src/Providers/HttpRouteProvider'
import { HttpServerProvider } from '#src/Providers/HttpServerProvider'
import { HelloController } from '#tests/Stubs/controllers/HelloController'

test.group('RouterTest', group => {
  group.each.setup(async () => {
    new HttpServerProvider().register()
    new HttpRouteProvider().register()
  })

  group.each.teardown(async () => {
    await new HttpServerProvider().shutdown()
  })

  test('should be able to list the route registered in the route class', async ({ assert }) => {
    Route.get('/test', ctx => ctx.response.send({ hello: 'world' }))

    const [route] = Route.listRoutes()

    assert.deepEqual(route.url, '/test')
    assert.deepEqual(route.methods, ['GET', 'HEAD'])
    assert.deepEqual(route.middlewares, { handlers: [], terminators: [], interceptors: [] })
    assert.deepEqual(route.fastifyOptions, { helmet: {}, schema: {}, rateLimitOptions: {}, config: { rateLimit: {} } })
  })

  test('should be able to register vanilla fastify routes using route class', async ({ assert }) => {
    Route.vanillaRoute({ url: '/test', handler: (_, res) => res.send({ hello: 'world' }), method: ['GET'] })

    const response = await Server.request({ path: '/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register a get route in the http server using route', async ({ assert }) => {
    Route.get('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register a head route in the http server using route', async ({ assert }) => {
    Route.head('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'head' })

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register a post route in the http server using route', async ({ assert }) => {
    Route.post('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'post' })

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register a put route in the http server using route', async ({ assert }) => {
    Route.put('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'put' })

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register a patch route in the http server using route', async ({ assert }) => {
    Route.patch('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'patch' })

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register a delete route in the http server using route', async ({ assert }) => {
    Route.delete('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'delete' })

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register a options route in the http server using route', async ({ assert }) => {
    Route.options('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'options' })

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register a any route in the http server using route', async ({ assert }) => {
    Route.any('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'head' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'post' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'patch' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'put' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'delete' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'options' })).json(), { hello: 'world' })
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

  test('should be able to register a route resource using route class', async ({ assert }) => {
    Route.resource('test', new HelloController())
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'post' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'get' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'put' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'patch' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'delete' })).json(), { hello: 'world' })
  })

  test('should be able to register a route resource only some routes using route class', async ({ assert }) => {
    Route.controller(new HelloController()).resource('test').only(['index'])
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'post' })).json(), {
      error: 'Not Found',
      message: 'Route POST:/test not found',
      statusCode: 404,
    })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'get' })).json(), {
      error: 'Not Found',
      message: 'Route GET:/test/:id not found',
      statusCode: 404,
    })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'put' })).json(), {
      error: 'Not Found',
      message: 'Route PUT:/test/:id not found',
      statusCode: 404,
    })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'patch' })).json(), {
      error: 'Not Found',
      message: 'Route PATCH:/test/:id not found',
      statusCode: 404,
    })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'delete' })).json(), {
      error: 'Not Found',
      message: 'Route DELETE:/test/:id not found',
      statusCode: 404,
    })
  })

  test('should be able to register a route resource except some routes using route class', async ({ assert }) => {
    Route.controller(new HelloController()).resource('test').except(['index'])
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'post' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'get' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'put' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'patch' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'delete' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      error: 'Not Found',
      message: 'Route GET:/test not found',
      statusCode: 404,
    })
  })

  test('should be able to register a resource inside the group using route class', async ({ assert }) => {
    Route.group(() => {
      Route.resource('test', new HelloController())
    }).prefix('/v1')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/v1/test', method: 'get' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/v1/test', method: 'post' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/v1/test/:id', method: 'get' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/v1/test/:id', method: 'put' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/v1/test/:id', method: 'patch' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/v1/test/:id', method: 'delete' })).json(), { hello: 'world' })
  })

  test('should be able to register a controller class as string in the resources of route', async ({ assert }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.resource('test', 'HelloController').only(['index'])
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
  })

  test('should be able to register a route resource with helmet options', async ({ assert }) => {
    await Server.plugin(import('@fastify/helmet'), { global: false })

    Route.resource('test', new HelloController())
      .only(['index'])
      .helmet({
        dnsPrefetchControl: { allow: true },
      })
    Route.register()

    const response = await Server.request({ path: '/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
    assert.deepEqual(
      response.headers['content-security-policy'],
      "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
    )
  })

  test('should be able to register a route resource with rate limit options', async ({ assert }) => {
    await Server.plugin(import('@fastify/rate-limit'), { global: false })

    Route.resource('test', new HelloController()).only(['index']).rateLimit({
      max: 100,
      timeWindow: '1 minute',
    })
    Route.register()

    const response = await Server.request({ path: '/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
    assert.deepEqual(response.headers['x-ratelimit-limit'], 100)
    assert.deepEqual(response.headers['x-ratelimit-remaining'], 99)
    assert.deepEqual(response.headers['x-ratelimit-reset'], 60)
  })

  test('should be able to register a controller class in the router to use in routes', async ({ assert }) => {
    Route.controller(new HelloController()).get('/test', 'index')
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
  })

  test('should be able to register a controller class as string in the router to use in routes', async ({ assert }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.controller('HelloController').get('/test', 'index')
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
  })
})
