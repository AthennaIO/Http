/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Server } from '#src/Facades/Server'
import { HttpServerProvider } from '#src/Providers/HttpServerProvider'

test.group('ServerTest', group => {
  group.each.setup(async () => {
    new HttpServerProvider().register()
  })

  group.each.teardown(async () => {
    await new HttpServerProvider().shutdown()
  })

  test('should be able to list the routes registered in the http server', async ({ assert }) => {
    Server.get({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const routes = Server.getRoutes()

    assert.equal(routes, '└── /test (GET)\n')
  })

  test('should be able to get the port where the http server is running', async ({ assert }) => {
    await Server.listen({ port: 9999 })

    assert.equal(Server.getPort(), 9999)

    await Server.close()
  })

  test('should be able to get the port where the http server is running', async ({ assert }) => {
    await Server.listen({ host: '0.0.0.0', port: 9999 })

    assert.equal(Server.getHost(), '0.0.0.0')

    await Server.close()
  })

  test('should return normaly if the http server is not running on close method', async ({ assert }) => {
    assert.isUndefined(await Server.close())
  })

  test('should be able to get the fastify version from the http server', async ({ assert }) => {
    assert.equal(Server.getFastifyVersion(), '4.11.0')
  })

  test('should be able to register fastify plugins in the http server', async ({ assert }) => {
    await Server.plugin(import('@fastify/cors'))
    Server.get({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request({ path: '/test', method: 'GET' })

    assert.equal(response.headers['access-control-allow-origin'], '*')
  })

  test('should be able to register get route in the http server', async ({ assert }) => {
    Server.get({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request({ path: '/test', method: 'GET' })

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register head route in the http server', async ({ assert }) => {
    Server.head({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request().head('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register post route in the http server', async ({ assert }) => {
    Server.post({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request().post('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register put route in the http server', async ({ assert }) => {
    Server.put({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request().put('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register patch route in the http server', async ({ assert }) => {
    Server.patch({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request().patch('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register delete route in the http server', async ({ assert }) => {
    Server.delete({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request().delete('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register options route in the http server', async ({ assert }) => {
    Server.options({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request().options('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to register exception handler and throw error in requests', async ({ assert }) => {
    Server.setErrorHandler(async ctx => {
      ctx.response.send({ status: ctx.error.status || 500, message: ctx.error.message })
    }).get({
      url: '/test',
      handler: () => {
        throw new Error('Something is wrong')
      },
    })

    const response = await Server.request().get('/test')

    assert.deepEqual(response.json(), { status: 500, message: 'Something is wrong' })
  })

  test('should be able to execute a handle middleware before going to the route handler', async ({ assert }) => {
    Server.use(async ctx => (ctx.data.handled = true), 'handle').get({
      url: '/test',
      handler: async ctx => ctx.response.send({ handled: ctx.data.handled }),
    })

    const response = await Server.request().get('/test')

    assert.deepEqual(response.json(), { handled: true })
  })

  test('should be able to execute a intercept middleware before returning the request', async ({ assert }) => {
    Server.use(ctx => {
      ctx.body.intercepted = true

      return ctx.body
    }, 'intercept').get({
      url: '/test',
      handler: async ctx => ctx.response.send({ hello: 'world' }),
    })

    const response = await Server.request().get('/test')

    assert.deepEqual(response.json(), { hello: 'world', intercepted: true })
  })

  test('should be able to execute a terminate middleware after returning the request', async ({ assert }) => {
    let terminated = false

    Server.use(() => {
      terminated = true
    }, 'terminate').get({
      url: '/test',
      handler: async ctx => ctx.response.send({ hello: 'world' }),
    })

    const response = await Server.request().get('/test')

    assert.isTrue(terminated)
    assert.deepEqual(response.json(), { hello: 'world' })
  })
})
