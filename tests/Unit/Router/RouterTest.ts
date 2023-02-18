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
import { HelloController } from '#tests/Stubs/controllers/HelloController'
import { UndefinedMethodException } from '#src/Exceptions/UndefinedMethodException'

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
    assert.deepEqual(route.middlewares, {
      middlewares: [],
      terminators: [],
      interceptors: [],
    })
    assert.deepEqual(route.fastify, { schema: {} })
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

  test('should throw an error when the controller dependency does not exist', async ({ assert }) => {
    assert.throws(() => Route.controller('NotFoundController').get('/test', 'index'))
  })

  test('should throw an error when the controller method does not exist', async ({ assert }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    assert.throws(() => Route.controller('HelloController').get('/test', 'not-found'), UndefinedMethodException)
  })

  test('should be able to register controllers dependency methods as string in routes', async ({ assert }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.get('/test', 'HelloController.index')
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
  })

  test('should throw an error when the controller method does not exist', async ({ assert }) => {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    assert.throws(() => Route.get('/test', 'HelloController.not-found'), UndefinedMethodException)
  })

  test('should be able to register a middleware closure in route using router', async ({ assert }) => {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).middleware(ctx => {
      ctx.data.handled = true
    })

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  })

  test('should be able to register an intercept middleware closure in route using router', async ({ assert }) => {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
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

  test('should be able to register a terminate middleware closure in route using router', async ({ assert }) => {
    let terminated = false

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world' })
    }).terminator(() => {
      terminated = true
    })

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
    assert.isTrue(terminated)
  })

  test('should be able to register a middleware class in route using router', async ({ assert }) => {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).middleware(new Middleware())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  })

  test('should be able to register an intercept middleware class in route using router', async ({ assert }) => {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).interceptor(new Interceptor())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true,
    })
  })

  test('should be able to register a terminate middleware class in route using router', async ({ assert }) => {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world' })
    }).terminator(new Terminator())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
  })

  test('should be able to register a middleware dependency in route using router', async ({ assert }) => {
    ioc.bind('App/Http/Middlewares/Middleware', Middleware)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).middleware('Middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  })

  test('should be able to register an intercept middleware dependency in route using router', async ({ assert }) => {
    ioc.bind('App/Http/Middlewares/Interceptor', Interceptor)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).interceptor('Interceptor')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true,
    })
  })

  test('should be able to register a terminate middleware dependency in route using router', async ({ assert }) => {
    ioc.bind('App/Http/Middlewares/Terminator', Terminator)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world' })
    }).terminator('Terminator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
  })

  test('should be able to register a middleware dependency in route using router', async ({ assert }) => {
    ioc.bind('App/Http/Middlewares/Names/middleware', Middleware)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).middleware('middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  })

  test('should be able to register an intercept middleware dependency in route using router', async ({ assert }) => {
    ioc.bind('App/Http/Middlewares/Names/interceptor', Interceptor)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).interceptor('interceptor')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true,
    })
  })

  test('should be able to register a named terminate middleware in route using router', async ({ assert }) => {
    ioc.bind('App/Http/Middlewares/Names/terminator', Terminator)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world' })
    }).terminator('terminator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
  })

  test('should throw an exception when trying to register a middleware that does not exist', async ({ assert }) => {
    assert.throws(() => Route.get('test', () => {}).middleware('not-found'))
  })

  test('should throw an exception when trying to register a interceptor middleware that does not exist', async ({
    assert,
  }) => {
    assert.throws(() => Route.get('test', () => {}).interceptor('not-found'))
  })

  test('should throw an exception when trying to register a terminator middleware that does not exist', async ({
    assert,
  }) => {
    assert.throws(() => Route.get('test', () => {}).terminator('not-found'))
  })

  test('should be able to set vanilla fastify options in route', async ({ assert }) => {
    let errorHappened = false
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.get('test', 'HelloController.vanillaError').vanillaOptions({
      onError: async () => {
        errorHappened = true
      },
    })

    Route.register()
    await Server.request({ path: '/test', method: 'get' })

    assert.isTrue(errorHappened)
  })
})
