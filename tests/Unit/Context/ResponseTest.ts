/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fastify } from 'fastify'
import { test } from '@japa/runner'
import { Response } from '#src/Context/Response'

test.group('ResponseTest', () => {
  test('should be able to set headers in response', async ({ assert }) => {
    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      response.header('key', 'value').removeHeader('key').safeHeader('key', 'value')

      await response.status(200).send()

      assert.equal(response.status, 200)
      assert.isDefined(response.responseTime)
      assert.isTrue(response.hasHeader('key'))
      assert.deepEqual(response.headers, { key: 'value' })
    })

    await server.inject().get('/test/1')
  })

  test('should be able to set verify if the response has been sent or not', async ({ assert }) => {
    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      assert.isFalse(response.sent)

      await response.status(200).send()

      assert.isTrue(response.sent)
    })

    await server.inject().get('/test/1')
  })

  test('should be able to get the headers after the response is sent', async ({ assert }) => {
    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      await response.status(200).send()

      response.header('key', 'value')

      assert.deepEqual(response.headers, { key: 'value' })
    })

    await server.inject().get('/test/1')
  })

  test('should be able to get the status code after the response is sent', async ({ assert }) => {
    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      await response.status(200).send()

      assert.equal(response.status, 200)
    })

    await server.inject().get('/test/1')
  })

  test('should be able to get the response time after the response is sent', async ({ assert }) => {
    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      await response.status(200).send()

      assert.isDefined(response.responseTime)
    })

    await server.inject().get('/test/1')
  })

  test('should be able to verify that the header exists in the response', async ({ assert }) => {
    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      await response.status(200).send()

      response.header('key', 'value')

      assert.isTrue(response.hasHeader('key'))
      assert.isFalse(response.hasHeader('not-found'))
    })

    await server.inject().get('/test/1')
  })

  test('should be able to redirect the request to other url', async ({ assert }) => {
    const server = fastify()

    server
      .get('/home', async (_, res) => {
        await res.status(200).send()
      })
      .get('/test/:id', async (_, res) => {
        const response = new Response(res)

        await response.redirectTo('/home')
      })

    const response = await server.inject().get('/test/1')

    assert.equal(response.statusCode, 302)
    assert.equal(response.headers.location, '/home')
  })

  test('should be able to redirect the request to other url and set a different status code', async ({ assert }) => {
    const server = fastify()

    server
      .get('/home', async (_, res) => {
        await res.status(200).send()
      })
      .get('/test/:id', async (_, res) => {
        const response = new Response(res)

        response.redirectTo('/home', 303)
      })

    const response = await server.inject().get('/test/1')

    assert.equal(response.statusCode, 303)
    assert.equal(response.headers.location, '/home')
  })

  test('should be able to apply helmet options in response', async ({ assert }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const server = fastify().register(import('@fastify/helmet'), { global: false })

    server.post('/test', async (_, res) => {
      const response = new Response(res)

      await response
        .status(200)
        .helmet({
          dnsPrefetchControl: { allow: true },
        })
        .send({})
    })

    const response = await server.inject().post('/test')

    assert.equal(response.statusCode, 200)
    assert.deepEqual(
      response.headers['content-security-policy'],
      "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
    )
  })
})
