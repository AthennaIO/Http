/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fastifyStatic from '@fastify/static'

import { fastify } from 'fastify'
import { Response } from '#src/context/Response'
import { Test, type Context } from '@athenna/test'
import { View, ViewProvider } from '@athenna/view'

export default class ResponseTest {
  @Test()
  public async shouldBeAbleToSetHeadersInResponse({ assert }: Context) {
    assert.plan(4)

    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      response.header('key', 'value').removeHeader('key').safeHeader('key', 'value')
      response
        .status(200)
        .send()
        .then(() => {
          assert.equal(response.statusCode, 200)
          assert.isTrue(response.hasHeader('key'))
          assert.deepEqual(response.headers, { key: 'value', 'content-length': '0' })
          assert.isDefined(response.responseTime)
        })
    })

    await server.inject().get('/test/1')
  }

  @Test()
  public async shouldBeAbleToSetVerifyIfTheResponseHasBeenSentOrNot({ assert }: Context) {
    assert.plan(2)

    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      assert.isFalse(response.sent)

      response
        .status(200)
        .send()
        .then(() => {
          assert.isTrue(response.sent)
        })
    })

    await server.inject().get('/test/1')
  }

  @Test()
  public async shouldBeAbleToGetTheHeadersAfterTheResponseIsSent({ assert }: Context) {
    assert.plan(1)

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
  public async shouldBeAbleToGetTheStatusCodeAfterTheResponseIsSent({ assert }: Context) {
    assert.plan(1)

    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      response
        .status(200)
        .send()
        .then(() => {
          assert.equal(response.statusCode, 200)
        })
    })

    await server.inject().get('/test/1')
  }

  @Test()
  public async shouldBeAbleToGetTheResponseBodyAfterTheResponseIsSent({ assert }: Context) {
    assert.plan(2)

    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      response
        .status(200)
        .send({ hello: 'world' })
        .then(() => {
          assert.equal(response.statusCode, 200)
          assert.deepEqual(response.body, { hello: 'world' })
        })
    })

    await server.inject().get('/test/1')
  }

  @Test()
  public async shouldBeAbleToGetTheResponseTimeAfterTheResponseIsSent({ assert }: Context) {
    assert.plan(1)

    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      response
        .status(200)
        .send()
        .then(() => {
          assert.isDefined(response.responseTime)
        })
    })

    await server.inject().get('/test/1')
  }

  @Test()
  public async shouldBeAbleToVerifyThatTheHeaderExistsInTheResponse({ assert }: Context) {
    assert.plan(2)

    const server = fastify()

    server.get('/test/:id', async (_, res) => {
      const response = new Response(res)

      response
        .status(200)
        .send()
        .then(() => {
          response.header('key', 'value')

          assert.isTrue(response.hasHeader('key'))
          assert.isFalse(response.hasHeader('not-found'))
        })
    })

    await server.inject().get('/test/1')
  }

  @Test()
  public async shouldBeAbleToRedirectTheRequestToOtherUrl({ assert }: Context) {
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
  public async shouldBeAbleToRedirectTheRequestToOtherUrlAndSetADifferentStatusCode({ assert }: Context) {
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
  public async shouldBeAbleToApplyHelmetOptionsInResponse({ assert }: Context) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const server = fastify().register(import('@fastify/helmet'), { global: false })

    server.post('/test', async (_, res) => {
      const response = new Response(res)

      await response
        .status(200)
        .helmet({
          dnsPrefetchControl: { allow: true }
        })
        .send({})
    })

    const response = await server.inject().post('/test')

    assert.equal(response.statusCode, 200)
    assert.deepEqual(
      response.headers['content-security-policy'],
      "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests"
    )
  }

  @Test()
  public async shouldBeAbleToReturnAViewInTheResponse({ assert }: Context) {
    assert.plan(2)

    const server = fastify()

    new ViewProvider().register()

    View.createComponent('head', '<h1>{{ name }}</h1>')

    server.get('/test/:id', async (_, res) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const response = new Response(res, {})

      response.view('head', { name: 'lenon' }).then(() => {
        assert.deepEqual(response.body, '<h1>lenon</h1>')
        assert.deepEqual(response.headers, { 'content-length': '0', 'content-type': 'text/html; charset=utf-8' })
      })
    })

    await server.inject().get('/test/1')
    ioc.reconstruct()
  }

  @Test()
  public async shouldBeAbleToAFileInTheResponseUsingSendFileMethod({ assert }: Context) {
    assert.plan(1)

    const server = fastify()

    server.register(fastifyStatic, {
      root: Path.fixtures('config')
    })

    server.get('/test', async (_, res) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const response = new Response(res, {})

      response.sendFile('app.ts').then(() => {
        assert.deepEqual(response.headers, { 'content-length': '0' })
      })
    })

    await server.inject().get('/test')
  }

  @Test()
  public async shouldBeAbleToAFileInTheResponseUsingDownloadMethod({ assert }: Context) {
    assert.plan(1)

    const server = fastify()

    server.register(fastifyStatic, {
      root: Path.fixtures('config')
    })

    server.get('/test', async (_, res) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const response = new Response(res, {})

      response.download('app.ts', 'a.ts').then(() => {
        assert.deepEqual(response.headers, {
          'content-length': '0',
          'content-disposition': 'attachment; filename="app.ts"'
        })
      })
    })

    await server.inject().get('/test')
  }
}
