/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fastify } from 'fastify'
import { Response } from '#src/Context/Response'
import { Test, TestContext } from '@athenna/test'

export default class ResponseTest {
  @Test()
  public async shouldBeAbleToSetHeadersInResponse({ assert }: TestContext) {
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
  }

  @Test()
  public async shouldBeAbleToSetVerifyIfTheResponseHasBeenSentOrNot({ assert }: TestContext) {
    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      assert.isFalse(response.sent)

      await response.status(200).send()

      assert.isTrue(response.sent)
    })

    await server.inject().get('/test/1')
  }

  @Test()
  public async shouldBeAbleToGetTheHeadersAfterTheResponseIsSent({ assert }: TestContext) {
    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      await response.status(200).send()

      response.header('key', 'value')

      assert.deepEqual(response.headers, { key: 'value' })
    })

    await server.inject().get('/test/1')
  }

  @Test()
  public async shouldBeAbleToGetTheStatusCodeAfterTheResponseIsSent({ assert }: TestContext) {
    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      await response.status(200).send()

      assert.equal(response.status, 200)
    })

    await server.inject().get('/test/1')
  }

  @Test()
  public async shouldBeAbleToGetTheResponseBodyAfterTheResponseIsSent({ assert }: TestContext) {
    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      await response.status(200).send({ hello: 'world' })

      assert.equal(response.status, 200)
      assert.equal(response.body, { hello: 'world' })
    })

    await server.inject().get('/test/1')
  }

  @Test()
  public async shouldBeAbleToGetTheResponseTimeAfterTheResponseIsSent({ assert }: TestContext) {
    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      await response.status(200).send()

      assert.isDefined(response.responseTime)
    })

    await server.inject().get('/test/1')
  }

  @Test()
  public async shouldBeAbleToVerifyThatTheHeaderExistsInTheResponse({ assert }: TestContext) {
    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      await response.status(200).send()

      response.header('key', 'value')

      assert.isTrue(response.hasHeader('key'))
      assert.isFalse(response.hasHeader('not-found'))
    })

    await server.inject().get('/test/1')
  }

  @Test()
  public async shouldBeAbleToRedirectTheRequestToOtherUrl({ assert }: TestContext) {
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
  }

  @Test()
  public async shouldBeAbleToRedirectTheRequestToOtherUrlAndSetADifferentStatusCode({ assert }: TestContext) {
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
  }

  @Test()
  public async shouldBeAbleToApplyHelmetOptionsInResponse({ assert }: TestContext) {
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
  }
}
