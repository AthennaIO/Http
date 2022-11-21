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

import { Server } from '#src/index'
import { HttpServerProvider } from '#src/Providers/HttpServerProvider'

test.group('HttpTest', group => {
  const handler = async ({ data, request, response }) => {
    const body = { hello: 'world' }

    body.ip = request.getFastifyRequest().ip
    body.body = request.body
    body.params = request.params
    body.queries = request.queries
    body.headers = request.headers
    body.method = request.method
    body.hostUrl = request.hostUrl
    body.baseUrl = request.baseUrl
    body.originalUrl = request.originalUrl

    if (data.param) body.param = data.param
    if (request.query('test')) body.test = request.query('test')
    if (request.query('throwError')) throw new Exception('Testing', 400)
    if (request.query('only')) body.only = request.only('hello')
    if (request.query('except')) body.except = request.except('hello')
    if (request.query('input')) {
      body.input = request.input('hello')
      body.inputNested = request.input('hello.0.world')
      body.inputNestedDefault = request.input('hello.0.world.not-found', 'default')
    }

    response.header('testing', 'hello')
    response.removeHeader('testing')
    response.safeHeader('testing', 'hello')

    response.status(200).getFastifyResponse().send(body)
  }

  group.each.setup(async () => {
    await new Folder(Path.stubs('app')).copy(Path.app())
    await new Folder(Path.stubs('config')).copy(Path.config())

    new HttpServerProvider().register()

    const interceptMid = ({ body }) => {
      body.hello = body.hello.replace('world', 'world-intercepted')

      return body
    }

    Server.use(({ data, request }) => {
      if (!request.queries.hello) {
        return
      }

      data.param = 'param'
      request.queries.test = 'middleware'
    }, 'handle')

    Server.get('/test', handler)
    Server.post('/test', handler)
    Server.put('/test', handler, { interceptors: [interceptMid] })
    Server.head('/test', handler)
    Server.patch('/test', handler)
    Server.delete('/test', handler)
    Server.options('/test', handler)

    await Server.listen()
  })

  group.each.teardown(async () => {
    await Server.close()

    await Folder.safeRemove(Path.app())
    await Folder.safeRemove(Path.config())
  })

  test('should be able to execute a get request', async ({ assert }) => {
    const response = await Server.request().get('/test')

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), {
      hello: 'world',
      ip: '127.0.0.1',
      body: {},
      params: {},
      queries: {},
      headers: {
        'user-agent': 'lightMyRequest',
        host: 'localhost:80',
      },
      method: 'GET',
      hostUrl: 'http://localhost:1335/test',
      baseUrl: '/test',
      originalUrl: '/test',
    })
  })

  test('should be able to throw errors inside the request', async ({ assert }) => {
    const response = await Server.request({ query: { throwError: 'true' } }).get('/test')

    assert.equal(response.statusCode, 400)
    assert.equal(response.json().statusCode, 400)
    assert.equal(response.json().code, 'EXCEPTION')
    assert.equal(response.json().message, 'Testing')
  })

  test('should be able to execute a post request that calls a handle middleware', async ({ assert }) => {
    const response = await Server.request().post('/test').query({ hello: 'true' })

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), {
      hello: 'world',
      ip: '127.0.0.1',
      body: {},
      params: {},
      queries: {
        hello: 'true',
        test: 'middleware',
      },
      headers: {
        'user-agent': 'lightMyRequest',
        host: 'localhost:80',
      },
      method: 'POST',
      hostUrl: 'http://localhost:1335/test?hello=true',
      baseUrl: '/test',
      originalUrl: '/test?hello=true',
      param: 'param',
      test: 'middleware',
    })
  })

  test('should be able to execute a put request that calls a intercept middleware', async ({ assert }) => {
    const response = await Server.request().put('/test')

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), {
      hello: 'world-intercepted',
      ip: '127.0.0.1',
      body: {},
      params: {},
      queries: {},
      headers: {
        'user-agent': 'lightMyRequest',
        host: 'localhost:80',
      },
      method: 'PUT',
      hostUrl: 'http://localhost:1335/test',
      baseUrl: '/test',
      originalUrl: '/test',
    })
  })

  test('should be able to list all routes registered', async ({ assert }) => {
    const routes = Server.getRoutes({ includeHooks: true })

    assert.isTrue(routes.includes('test (HEAD)'))
    assert.isTrue(routes.includes('preHandler'))
  })

  test('should be able to get values from the body using the input, only and except method', async ({ assert }) => {
    const response = await Server.request()
      .post('/test?input=true&only=true&except=true')
      .body({ hello: [{ world: 'nice' }], world: 'hello' })

    const body = response.json()

    assert.deepEqual(body.except, { world: 'hello' })
    assert.deepEqual(body.only, { hello: [{ world: 'nice' }] })

    assert.deepEqual(body.input, [{ world: 'nice' }])
    assert.deepEqual(body.inputNested, 'nice')
    assert.deepEqual(body.inputNestedDefault, 'default')
  })
})
