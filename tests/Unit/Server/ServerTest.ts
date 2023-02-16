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

  test('should be able to register get route in http server', async ({ assert }) => {
    HttpServer.get({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await HttpServer.request().get('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  }).pin()

  test('should be able to register head route in http server', async ({ assert }) => {
    HttpServer.head({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await HttpServer.request().head('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  }).pin()

  test('should be able to register post route in http server', async ({ assert }) => {
    HttpServer.post({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await HttpServer.request().post('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  }).pin()

  test('should be able to register put route in http server', async ({ assert }) => {
    HttpServer.put({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await HttpServer.request().put('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  }).pin()

  test('should be able to register patch route in http server', async ({ assert }) => {
    HttpServer.patch({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await HttpServer.request().patch('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  }).pin()

  test('should be able to register delete route in http server', async ({ assert }) => {
    HttpServer.delete({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await HttpServer.request().delete('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  }).pin()

  test('should be able to register options route in http server', async ({ assert }) => {
    HttpServer.options({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await HttpServer.request().options('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  }).pin()

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
  }).pin()

  test('should be able to execute a handle middleware before going to the route handler', async ({ assert }) => {
    HttpServer.use(async ctx => (ctx.data.handled = true), 'handle').get({
      url: '/test',
      handler: async ctx => ctx.response.send({ handled: ctx.data.handled }),
    })

    const response = await HttpServer.request().get('/test')

    assert.deepEqual(response.json(), { handled: true })
  }).pin()

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
  }).pin()

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
  }).pin()
})
