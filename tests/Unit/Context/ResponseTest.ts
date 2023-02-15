/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Response } from '#src/Context/Response'
import fastify, { FastifyInstance } from 'fastify'

test.group('ResponseTest', group => {
  let server: FastifyInstance = null

  group.each.teardown(async () => {
    if (server) {
      await server.close()
    }
  })

  test('should be able to set headers in response', async ({ assert }) => {
    server = fastify.fastify()

    await server
      .get('/test/:id', async (_, res) => {
        const response = new Response(res)

        response.header('key', 'value').removeHeader('key').safeHeader('key', 'value')

        await response.status(200).send()

        assert.equal(response.status, 200)
        assert.isDefined(response.responseTime)
        assert.isTrue(response.hasHeader('key'))
        assert.deepEqual(response.headers, { key: 'value' })
      })
      .listen({ port: 9999 })

    await server.inject().get('/test/1')
    await server.close()
    server = null
  })

  test('should be able to set verify if the response has been sent or not', async ({ assert }) => {
    server = fastify.fastify()

    await server
      .get('/test/:id', async (_, res) => {
        const response = new Response(res)

        assert.isFalse(response.sent)

        await response.status(200).send()

        assert.isTrue(response.sent)
      })
      .listen({ port: 9999 })

    await server.inject().get('/test/1')
    await server.close()
    server = null
  })

  test('should be able to get the headers, status code and response time after the response is sent', async ({
    assert,
  }) => {
    server = fastify.fastify()

    await server
      .get('/test/:id', async (_, res) => {
        const response = new Response(res)

        await response.status(200).send()

        response.header('key', 'value')

        assert.equal(response.status, 200)
        assert.isDefined(response.responseTime)
        assert.deepEqual(response.headers, { key: 'value' })
      })
      .listen({ port: 9999 })

    await server.inject().get('/test/1')
    await server.close()
    server = null
  })

  test('should be able to redirect the request to other url', async ({ assert }) => {
    server = fastify.fastify()
    await server
      .get('/home', async (_, res) => {
        await res.status(200).send()
      })
      .get('/test/:id', async (_, res) => {
        const response = new Response(res)

        response.redirectTo('/home')
      })
      .listen({ port: 9999 })

    const response = await server.inject().get('/test/1')

    assert.equal(response.statusCode, 302)
    assert.equal(response.headers.location, '/home')

    await server.close()
    server = null
  })

  test('should be able to redirect the request to other url and set a different status code', async ({ assert }) => {
    server = fastify.fastify()
    await server
      .get('/home', async (_, res) => {
        await res.status(200).send()
      })
      .get('/test/:id', async (_, res) => {
        const response = new Response(res)

        response.redirectTo('/home', 303)
      })
      .listen({ port: 9999 })

    const response = await server.inject().get('/test/1')

    assert.equal(response.statusCode, 303)
    assert.equal(response.headers.location, '/home')

    await server.close()
    server = null
  })
})
