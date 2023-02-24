/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Request } from '#src/Context/Request'
import { fastify, FastifyInstance, FastifyRequest } from 'fastify'

test.group('RequestTest', group => {
  let server: FastifyInstance
  let request: FastifyRequest

  group.each.setup(async () => {
    server = fastify()

    await server.post('/test/:id', req => (request = req))
    await server.inject().post('/test/1?query=true').body({ name: 'João', email: 'lenon@athenna.io', other: 'other' })
  })

  test('should be able to get the request id', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.equal(ctx.request.id, 'req-1')
  })

  test('should be able to get the request ip', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.equal(ctx.request.ip, '127.0.0.1')
  })

  test('should be able to get the request hostname', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.equal(ctx.request.hostname, 'localhost:80')
  })

  test('should be able to get the request protocol', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.equal(ctx.request.protocol, 'http')
  })

  test('should be able to get the request method', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.equal(ctx.request.method, 'POST')
  })

  test('should be able to get all types of urls from the request', async ({ assert }) => {
    await server.listen({ port: 9999 })
    const ctx = { request: new Request(request) }

    assert.equal(ctx.request.baseUrl, '/test/1')
    assert.equal(ctx.request.baseHostUrl, 'http://127.0.0.1:9999/test/1')
    assert.equal(ctx.request.routeUrl, '/test/:id')
    assert.equal(ctx.request.routeHostUrl, 'http://127.0.0.1:9999/test/:id')
    assert.equal(ctx.request.originalUrl, '/test/1?query=true')
    assert.equal(ctx.request.originalHostUrl, 'http://127.0.0.1:9999/test/1?query=true')
    await server.close()
  })

  test('should be able to get the request body', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.deepEqual(ctx.request.body, {
      email: 'lenon@athenna.io',
      name: 'João',
      other: 'other',
    })
  })

  test('should be able to get the request params', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.deepEqual(ctx.request.params, {
      id: '1',
    })
  })

  test('should be able to get the request queries', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.deepEqual(ctx.request.queries, {
      query: 'true',
    })
  })

  test('should be able to get the request headers', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.deepEqual(ctx.request.headers, {
      'content-length': '59',
      'content-type': 'application/json',
      host: 'localhost:80',
      'user-agent': 'lightMyRequest',
    })
  })

  test('should be able to get the server port from request', async ({ assert }) => {
    await server.listen({ port: 9999 })
    const ctx = { request: new Request(request) }

    assert.equal(ctx.request.port, 9999)
    await server.close()
  })

  test('should be able to get the server version from request', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.equal(ctx.request.version, '4.12.0')
  })

  test('should be able to get the separated values from request body', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.equal(ctx.request.input('name', 'test'), 'João')
    assert.equal(ctx.request.input('not-found.name', 'test'), 'test')
  })

  test('should be able to get the separated values from request params', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.equal(ctx.request.param('id', 'test'), '1')
    assert.equal(ctx.request.param('not-found', 'test'), 'test')
  })

  test('should be able to get the separated values from request queries', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.equal(ctx.request.query('query', 'test'), 'true')
    assert.equal(ctx.request.query('not-found', 'test'), 'test')
  })

  test('should be able to get the separated values from request headers', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.equal(ctx.request.header('host', 'test'), 'localhost:80')
    assert.equal(ctx.request.header('not-found', 'test'), 'test')
  })

  test('should be able to get only the selected values from the request body', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.deepEqual(ctx.request.only(['name', 'email']), { name: 'João', email: 'lenon@athenna.io' })
  })

  test('should be able to get all the request body except name and email', async ({ assert }) => {
    const ctx = { request: new Request(request) }

    assert.deepEqual(ctx.request.except(['name', 'email']), { other: 'other' })
  })
})