/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Exception, Folder, Path } from '@athenna/common'

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
      .middleware(({ data }) => {
        data.midHandler = true
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
      Route.get('test', 'TestController.show').middleware(({ request }) => {
        request.queries.throwError = 'true'
      })

      Route.patch('test', 'TestController.show').middleware(({ data }) => {
        data.midHandler = false
        data.patchHandler = true
      })

      Route.resource('tests', 'TestController')
        .only(['store'])
        .middleware(({ data }) => {
          data.rscHandler = true
        })
    })
      .prefix('v1')
      .middleware('HandleMiddleware')
      .middleware('TerminateMiddleware')
      .middleware(({ data }) => {
        data.midHandler = true
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

    Route.get('test', 'TestController.index').middleware(() => {
      terminated = true
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
      .middleware(() => {
        terminated = true
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
      .middleware(() => {
        terminated = true
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

  test('should be able to set swagger configurations to route', async ({ assert }) => {
    await Server.registerSwagger()

    Route.group(() => {
      Route.get('hello/:id', ctx => {
        return ctx.response.status(200).json({ hello: 'world' })
      })
        .queryString('name')
        .response(200, {
          description: 'Successful response',
          properties: { hello: { type: 'string' } },
        })
      Route.resource('tests', 'TestController').except('update', 'delete').swagger('index', { description: 'Get all' })
    }).swagger({ security: [] })

    Route.register()

    await Server.listen(3049)

    const response = await Server.request().get('/documentation/json')

    assert.deepEqual(response.json().swagger, '2.0')
    assert.deepEqual(response.json().info, { version: '8.1.0', title: '@fastify/swagger' })
    assert.isDefined(response.json().paths['/tests'])
    assert.isDefined(response.json().paths['/tests/{id}'])
    assert.isDefined(response.json().paths['/tests/{id}'].get.parameters[0].in, 'path')
    assert.isDefined(response.json().paths['/tests/{id}'].get.parameters[0].name, 'id')
    assert.deepEqual(response.json().paths['/hello/{id}'].get.security, [])
    assert.deepEqual(response.json().paths['/hello/{id}'].get.parameters[0].in, 'query')
    assert.deepEqual(response.json().paths['/hello/{id}'].get.parameters[0].name, 'name')
    assert.deepEqual(response.json().paths['/hello/{id}'].get.parameters[1].in, 'path')
    assert.deepEqual(response.json().paths['/hello/{id}'].get.parameters[1].name, 'id')
    assert.deepEqual(response.json().paths['/hello/{id}'].get.responses['200'].schema.properties.hello.type, 'string')
  })

  test('should be able to set helmet configurations to route', async ({ assert }) => {
    await Server.registerHelmet()

    Route.group(() => {
      Route.resource('tests', 'TestController')
        .except('update', 'delete')
        .helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false })
    }).helmet({ crossOriginEmbedderPolicy: true, contentSecurityPolicy: true })

    Route.register()

    await Server.listen(3049)

    const response = await Server.request().get('/tests')

    assert.isDefined(response.headers['content-security-policy'])
    assert.isDefined(response.headers['cross-origin-embedder-policy'])
  })
})
