/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { HttpServer } from '#src/Facades/HttpServer'
import { HttpServerProvider } from '#src/Providers/HttpServerProvider'

test.group('ServerTest', group => {
  group.each.setup(async () => {
    new HttpServerProvider().register()
  })

  group.each.teardown(async () => {
    await new HttpServerProvider().shutdown()
  })

  test('should be able to list the routes registered in the http server', async ({ assert }) => {
    HttpServer.get({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const routes = HttpServer.getRoutes()

    assert.equal(routes, '└── /test (GET)\n')
  })

  test('should be able to get the port where the http server is running', async ({ assert }) => {
    await HttpServer.listen({ port: 9999 })

    assert.equal(HttpServer.getPort(), 9999)

    await HttpServer.close()
  })

  test('should be able to get the port where the http server is running', async ({ assert }) => {
    await HttpServer.listen({ host: '0.0.0.0', port: 9999 })

    assert.equal(HttpServer.getHost(), '0.0.0.0')

    await HttpServer.close()
  })

  test('should return normaly if the http server is not running on close method', async ({ assert }) => {
    assert.isUndefined(await HttpServer.close())
  })

  test('should be able to get the fastify version from the http server', async ({ assert }) => {
    assert.equal(HttpServer.getFastifyVersion(), '4.11.0')
  })

  test('should be able to register fastify plugins in the http server', async ({ assert }) => {
    await HttpServer.plugin(import('@fastify/cors'))
    HttpServer.get({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await HttpServer.request({ path: '/test', method: 'GET' })

    assert.equal(response.headers['access-control-allow-origin'], '*')
  })

  test('should be able to register get route in the http server', async ({ assert }) => {
    HttpServer.get({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await HttpServer.request({ path: '/test', method: 'GET' })

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register head route in the http server', async ({ assert }) => {
    HttpServer.head({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await HttpServer.request().head('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register post route in the http server', async ({ assert }) => {
    HttpServer.post({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await HttpServer.request().post('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register put route in the http server', async ({ assert }) => {
    HttpServer.put({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await HttpServer.request().put('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register patch route in the http server', async ({ assert }) => {
    HttpServer.patch({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await HttpServer.request().patch('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register delete route in the http server', async ({ assert }) => {
    HttpServer.delete({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await HttpServer.request().delete('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register options route in the http server', async ({ assert }) => {
    HttpServer.options({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await HttpServer.request().options('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register exception handler and throw error in requests', async ({ assert }) => {
    HttpServer.setErrorHandler(async ctx => {
      ctx.response.send({ status: ctx.error.status || 500, message: ctx.error.message })
    }).get({
      url: '/test',
      handler: () => {
        throw new Error('Something is wrong')
      },
    })

    const response = await HttpServer.request().get('/test')

    assert.deepEqual(response.json(), { status: 500, message: 'Something is wrong' })
  })

  test('should be able to execute a handle middleware before going to the route handler', async ({ assert }) => {
    HttpServer.use(async ctx => (ctx.data.handled = true), 'handle').get({
      url: '/test',
      handler: async ctx => ctx.response.send({ handled: ctx.data.handled }),
    })

    const response = await HttpServer.request().get('/test')

    assert.deepEqual(response.json(), { handled: true })
  })

  test('should be able to execute a intercept middleware before returning the request', async ({ assert }) => {
    HttpServer.use(ctx => {
      ctx.body.intercepted = true

      return ctx.body
    }, 'intercept').get({
      url: '/test',
      handler: async ctx => ctx.response.send({ hello: 'world' }),
    })

    const response = await HttpServer.request().get('/test')

    assert.deepEqual(response.json(), { hello: 'world', intercepted: true })
  })

  test('should be able to execute a terminate middleware after returning the request', async ({ assert }) => {
    let terminated = false

    HttpServer.use(() => {
      terminated = true
    }, 'terminate').get({
      url: '/test',
      handler: async ctx => ctx.response.send({ hello: 'world' }),
    })

    const response = await HttpServer.request().get('/test')

    assert.isTrue(terminated)
    assert.deepEqual(response.json(), { hello: 'world' })
  })
})
