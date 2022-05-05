/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import '@athenna/ioc'

import { test } from '@japa/runner'
import { Exception, Folder, Path } from '@secjs/utils'

import { Server } from '#src/Facades/Server'
import { HttpServerProvider } from '#src/Providers/HttpServerProvider'

test.group('HttpTest', group => {
  const handler = async ({ data, request, response }) => {
    const body = { hello: 'world' }

    if (data.param) body.param = data.param
    if (request.queries.test) body.test = request.query('test')
    if (request.queries.throwError) throw new Exception('Testing', 400)

    response.status(200).send(body)
  }

  group.each.setup(async () => {
    await new Folder(Path.stubs('config')).copy(Path.config())

    new HttpServerProvider().register()

    const interceptMid = ({ body }) => {
      body.hello = body.hello.replace('world', 'world-intercepted')

      return body
    }

    const handleMid = ({ data, request, next }) => {
      data.param = 'param'
      request.queries.test = 'middleware'

      next()
    }

    Server.get('/test', handler)
    Server.post('/test', handler, { handlers: [handleMid] })
    Server.put('/test', handler, { interceptors: [interceptMid] })
    Server.head('/test', handler)
    Server.patch('/test', handler)
    Server.delete('/test', handler)
    Server.options('/test', handler)

    await Server.listen()
  })

  group.each.teardown(async () => {
    await Server.close()

    await Folder.safeRemove(Path.config())
  })

  test('should be able to execute a request in test route', async ({ assert }) => {
    const response = await Server.request().get('/test')

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register a new route with a middleware', async ({ assert }) => {
    const response = await Server.request().post('/test')

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), {
      hello: 'world',
      param: 'param',
      test: 'middleware',
    })
  })

  test('should be able to throw custom errors inside handlers', async ({ assert }) => {
    const response = await Server.request().get('/test').query({ throwError: 'true' })

    assert.equal(response.statusCode, 400)
    assert.equal(response.json().statusCode, 400)
    assert.equal(response.json().code, 'EXCEPTION')
    assert.equal(response.json().message, 'Testing')
  })

  test('should be able to register a new route with a intercept middleware', async ({ assert }) => {
    const response = await Server.request().put('/test')

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), {
      hello: 'world-intercepted',
    })
  })
})
