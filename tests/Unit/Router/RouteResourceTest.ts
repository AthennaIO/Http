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
import { HelloController } from '#tests/Stubs/controllers/HelloController'
import { Route, Server, HttpRouteProvider, HttpServerProvider } from '#src'

test.group('RouteResourceTest', group => {
  group.each.setup(async () => {
    ioc.reconstruct()

    new HttpServerProvider().register()
    new HttpRouteProvider().register()
  })

  group.each.teardown(async () => {
    await new HttpServerProvider().shutdown()
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

  test('should throw an exception when controller class dependency does not exist', async ({ assert }) => {
    assert.throws(() => Route.resource('test', 'NotFoundController'))
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

  test('should be able to register a middleware closure in route resource using router', async ({ assert }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.controller('HelloController')
      .resource('test')
      .only(['index'])
      .middleware(ctx => (ctx.data.handled = true))

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  })

  test('should be able to register an intercept middleware closure in route resource using router', async ({
    assert,
  }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.controller('HelloController')
      .resource('test')
      .only(['index'])
      .interceptor(ctx => {
        ctx.body.intercepted = true

        return ctx.body
      })

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true,
    })
  })

  test('should be able to register a terminate middleware closure in route resource using router', async ({
    assert,
  }) => {
    let terminated = false
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.controller('HelloController')
      .resource('test')
      .only(['index'])
      .terminator(() => {
        terminated = true
      })

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
    assert.isTrue(terminated)
  })

  test('should be able to register a middleware class in route resource using router', async ({ assert }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.controller('HelloController').resource('test').only(['index']).middleware(new Middleware())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  })

  test('should be able to register an intercept middleware class in route resource using router', async ({
    assert,
  }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.controller('HelloController').resource('test').only(['index']).interceptor(new Interceptor())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true,
    })
  })

  test('should be able to register a terminate middleware class in route resource using router', async ({ assert }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.controller('HelloController').resource('test').only(['index']).terminator(new Terminator())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
  })

  test('should be able to register a middleware dependency in route resource using router', async ({ assert }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)
    ioc.bind('App/Http/Middlewares/Middleware', Middleware)

    Route.controller('HelloController').resource('test').only(['index']).middleware('Middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  })

  test('should be able to register an intercept middleware dependency in route resource using router', async ({
    assert,
  }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)
    ioc.bind('App/Http/Interceptors/Interceptor', Interceptor)

    Route.controller('HelloController').resource('test').only(['index']).interceptor('Interceptor')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true,
    })
  })

  test('should be able to register a terminate middleware dependency in route resource using router', async ({
    assert,
  }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)
    ioc.bind('App/Http/Terminators/Terminator', Terminator)

    Route.controller('HelloController').resource('test').only(['index']).terminator('Terminator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
  })

  test('should be able to register a named middleware in route resource using router', async ({ assert }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)
    ioc.bind('App/Http/Middlewares/Names/my-middleware', Middleware)

    Route.controller('HelloController').resource('test').only(['index']).middleware('my-middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  })

  test('should be able to register an intercept named middleware in route resource using router', async ({
    assert,
  }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)
    ioc.bind('App/Http/Interceptors/Names/my-interceptor', Interceptor)

    Route.controller('HelloController').resource('test').only(['index']).interceptor('my-interceptor')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true,
    })
  })

  test('should be able to register a terminate named middleware in route resource using router', async ({ assert }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)
    ioc.bind('App/Http/Terminators/Names/my-terminator', Terminator)

    Route.controller('HelloController').resource('test').only(['index']).terminator('my-terminator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
  })

  test('should throw an exception when middleware name and dependency does not exist', async ({ assert }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    assert.throws(() => Route.resource('test', 'HelloController').middleware('not-found'))
  })

  test('should throw an exception when interceptor middleware name and dependency does not exist', async ({
    assert,
  }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    assert.throws(() => Route.resource('test', 'HelloController').interceptor('not-found'))
  })

  test('should throw an exception when terminator middleware name and dependency does not exist', async ({
    assert,
  }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    assert.throws(() => Route.resource('test', 'HelloController').terminator('not-found'))
  })
})
