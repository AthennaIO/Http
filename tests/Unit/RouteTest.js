/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Exception, Folder, Path } from '@secjs/utils'

import { Route, Server } from '#src/index'
import { HttpRouteProvider } from '#src/Providers/HttpRouteProvider'
import { ControllerProvider } from '#src/Providers/ControllerProvider'
import { MiddlewareProvider } from '#src/Providers/MiddlewareProvider'
import { HttpServerProvider } from '#src/Providers/HttpServerProvider'
import { TestController } from '#tests/Stubs/app/Http/Controllers/TestController'
import { UndefinedMethodException } from '#src/Exceptions/UndefinedMethodException'
import { HandleMiddleware } from '#tests/Stubs/app/Http/Middlewares/HandleMiddleware'
import { InterceptMiddleware } from '#tests/Stubs/app/Http/Middlewares/InterceptMiddleware'
import { TerminateMiddleware } from '#tests/Stubs/app/Http/Middlewares/TerminateMiddleware'

test.group('RouteTest', group => {
  const handler = async ({ data, request, response }) => {
    const body = {
      hello: request.payload('world', 'world'),
      param: request.param('param', 'param'),
      query: request.query('query', 'query'),
      header: request.header('header', 'header'),
    }

    if (data.param) body.param = data.param
    if (data.midHandler) body.midHandler = data.midHandler
    if (request.queries.test) data.test = request.query('test')
    if (request.queries.throwError) throw new Exception('Testing', 400)

    response.status(200).send(body)
  }

  group.each.setup(async () => {
    await new Folder(Path.stubs('app')).copy(Path.app())

    new HttpServerProvider().register()
    new HttpRouteProvider().boot()
    await new ControllerProvider().boot()
    await new MiddlewareProvider().boot()
  })

  group.each.teardown(async () => {
    await Server.close()
    await Folder.safeRemove(Path.app())
  })

  test('should be able to register a new route', async ({ assert }) => {
    Route.get('test', handler)
    Route.register()

    await Server.listen(3040)

    const response = await Server.request().get('/test')

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { hello: 'world', param: 'param', query: 'query', header: 'header' })
  })

  test('should be able to redirect a route', async ({ assert }) => {
    Route.get('hello', ({ response }) => {
      return response.send({ hello: 'world' })
    })
    Route.redirect('test', 'hello')
    Route.register()

    await Server.listen(3040)

    const { headers, statusCode } = await Server.request().get('/test')

    assert.equal(statusCode, 302)
    assert.equal(headers.location, 'hello')
  })

  test('should be able to register a new route group', async ({ assert }) => {
    Route.group(() => {
      Route.get('test', handler)
      Route.post('test', handler)
    }).prefix('v1')

    Route.register()

    await Server.listen(3041)

    const get = await Server.request({ headers: { header: 'testing' } }).get('/v1/test?query=testing')

    assert.equal(get.statusCode, 200)
    assert.deepEqual(get.json(), { hello: 'world', param: 'param', query: 'testing', header: 'testing' })

    const post = await Server.request().post('/v1/test', { world: 'world' })

    assert.equal(post.statusCode, 200)
    assert.deepEqual(post.json(), { hello: 'world', param: 'param', query: 'query', header: 'header' })
  })

  test('should be able to register a new route resource', async ({ assert }) => {
    Route.resource('test', new TestController()).only(['store'])
    Route.resource('tests', 'TestController').only(['store'])
    Route.resource('tests.subTests', 'TestController').only(['store'])

    Route.register()

    await Server.listen(3042)

    const postTest = await Server.request().post('/test')

    assert.equal(postTest.statusCode, 200)
    assert.deepEqual(postTest.json(), { hello: 'world' })

    const postTests = await Server.request().post('/tests')

    assert.equal(postTests.statusCode, 200)
    assert.deepEqual(postTests.json(), { hello: 'world' })

    const postSubTests = await Server.request().post('/tests/1/subTests')

    assert.equal(postSubTests.statusCode, 200)
    assert.deepEqual(postSubTests.json(), { hello: 'world' })
  })

  test('should be able to register a new route with middleware', async ({ assert }) => {
    Route.get('test', 'TestController.index')
      .middleware(new HandleMiddleware())
      .middleware(new InterceptMiddleware())
      .middleware(new TerminateMiddleware())
      .middleware(({ data, next }) => {
        data.midHandler = true

        next()
      })

    Route.register()

    await Server.listen(3043)

    const get = await Server.request().get('/test')

    assert.equal(get.statusCode, 200)
    assert.deepEqual(get.json(), {
      hello: 'world',
      midHandler: true,
      middlewares: ['handle', 'intercept'],
    })
  })

  test('should be able to register a new group with resource inside', async ({ assert }) => {
    Route.group(() => {
      Route.get('test', 'TestController.show').middleware(({ next, request }) => {
        request.queries.throwError = 'true'

        next()
      })

      Route.patch('test', 'TestController.show').middleware(({ data, next }) => {
        data.midHandler = false
        data.patchHandler = true

        next()
      })

      Route.resource('tests', 'TestController')
        .only(['store'])
        .middleware(({ data, next }) => {
          data.rscHandler = true

          next()
        })
    })
      .prefix('v1')
      .middleware('HandleMiddleware')
      .middleware('TerminateMiddleware')
      .middleware(({ data, next }) => {
        data.midHandler = true

        next()
      })

    Route.register()

    await Server.listen(3044)

    const get = await Server.request().get('/v1/test')

    assert.equal(get.statusCode, 400)
    assert.equal(get.json().statusCode, 400)
    assert.equal(get.json().message, 'Testing')

    const patch = await Server.request().patch('/v1/test')

    assert.equal(patch.statusCode, 200)
    assert.deepEqual(patch.json(), {
      hello: 'world',
      midHandler: true,
      patchHandler: true,
      middlewares: ['handle'],
    })

    const post = await Server.request().post('/v1/tests')

    assert.equal(post.statusCode, 200)
    assert.deepEqual(post.json(), {
      hello: 'world',
      midHandler: true,
      rscHandler: true,
      middlewares: ['handle'],
    })
  })

  test('should be able to register a new route with intercept middleware', async ({ assert }) => {
    Route.get('testing', 'TestController.index').middleware('HandleMiddleware').middleware('InterceptMiddleware')
    Route.register()

    await Server.listen(3045)

    const response = await Server.request().get('/testing')

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), {
      hello: 'world',
      middlewares: ['handle', 'intercept'],
    })
  })

  test('should be able to register a new route with terminate middleware', async ({ assert }) => {
    let terminated = false

    Route.get('test', 'TestController.index').middleware(ctx => {
      terminated = true

      ctx.next()
    }, 'terminate')

    Route.register()

    await Server.listen(3046)

    const response = await Server.request().get('/test')

    assert.isTrue(terminated)
    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), {
      hello: 'world',
    })
  })

  test('should be able to register a new route with middleware and controller direct class', async ({ assert }) => {
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

    assert.isTrue(terminated)
    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), {
      hello: 'world',
      middlewares: ['handle'],
    })
  })

  test('should be able to register a new route with middleware direct class on groups', async ({ assert }) => {
    let terminated = false

    Route.controller(new TestController())
      .group(() => {
        Route.get('test', 'index')
      })
      .prefix('api/v1')
      .middleware(new HandleMiddleware())
      .middleware(({ next }) => {
        terminated = true

        next()
      }, 'terminate')

    Route.register()

    await Server.listen(3048)

    const response = await Server.request().get('/api/v1/test')

    assert.isTrue(terminated)
    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), {
      hello: 'world',
      middlewares: ['handle'],
    })
  })

  test('should throw undefined method exception when controller method doesnt exist', async ({ assert }) => {
    Route.delete('/test', 'TestController.delete')

    const useCase = () => Route.register()

    assert.throws(useCase, UndefinedMethodException)
  })
})
