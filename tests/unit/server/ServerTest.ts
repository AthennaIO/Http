/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Server, HttpServerProvider } from '#src'
import { Test, AfterEach, BeforeEach, type Context } from '@athenna/test'

export default class ServerTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    new HttpServerProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    await new HttpServerProvider().shutdown()
  }

  @Test()
  public async shouldBeAbleToListTheRoutesRegisteredInTheHttpServer({ assert }: Context) {
    Server.get({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const routes = Server.getRoutes()

    assert.equal(routes, '└── /\n' + '    └── test (GET)\n')
  }

  @Test()
  public async shouldBeAbleToGetThePortWhereTheHttpServerIsRunning({ assert }: Context) {
    await Server.listen({ port: 9999 })

    assert.equal(Server.getPort(), 9999)

    await Server.close()
  }

  @Test()
  public async shouldBeAbleToGetTheHostWhereTheHttpServerIsRunning({ assert }: Context) {
    await Server.listen({ host: '0.0.0.0', port: 9999 })

    assert.equal(Server.getHost(), '0.0.0.0')

    await Server.close()
  }

  @Test()
  public async shouldReturnNormalyIfTheHttpServerIsNotRunningOnCloseMethod({ assert }: Context) {
    assert.isUndefined(await Server.close())
  }

  @Test()
  public async shouldBeAbleToGetTheFastifyVersionFromTheHttpServer({ assert }: Context) {
    assert.equal(Server.getFastifyVersion(), '4.21.0')
  }

  @Test()
  public async shouldBeAbleToRegisterFastifyPluginsInTheHttpServer({ assert }: Context) {
    await Server.plugin(import('@fastify/cors'))
    Server.get({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request({ path: '/test', method: 'GET' })

    assert.equal(response.headers['access-control-allow-origin'], '*')
  }

  @Test()
  public async shouldBeAbleToRegisterGetRouteInTheHttpServer({ assert }: Context) {
    Server.get({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request({ path: '/test', method: 'GET' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterHeadRouteInTheHttpServer({ assert }: Context) {
    Server.head({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request().head('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterPostRouteInTheHttpServer({ assert }: Context) {
    Server.post({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request().post('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterPutRouteInTheHttpServer({ assert }: Context) {
    Server.put({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request().put('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterPatchRouteInTheHttpServer({ assert }: Context) {
    Server.patch({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request().patch('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterDeleteRouteInTheHttpServer({ assert }: Context) {
    Server.delete({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request().delete('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterOptionsRouteInTheHttpServer({ assert }: Context) {
    Server.options({ url: '/test', handler: ctx => ctx.response.send({ hello: 'world' }) })

    const response = await Server.request().options('/test')

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterExceptionHandlerInTheHttpServer({ assert }: Context) {
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
  }

  @Test()
  public async shouldBeAbleToExecuteAMiddlewareBeforeGoingToTheRouteHandler({ assert }: Context) {
    Server.middleware(async ctx => (ctx.data.handled = true)).get({
      url: '/test',
      handler: async ctx => ctx.response.send({ handled: ctx.data.handled }),
    })

    const response = await Server.request().get('/test')

    assert.deepEqual(response.json(), { handled: true })
  }

  @Test()
  public async shouldBeAbleToExecuteAnInterceptMiddlewareBeforeReturningTheRequest({ assert }: Context) {
    Server.intercept(ctx => {
      ctx.body.intercepted = true

      return ctx.body
    }).get({
      url: '/test',
      handler: async ctx => ctx.response.send({ hello: 'world' }),
    })

    const response = await Server.request().get('/test')

    assert.deepEqual(response.json(), { hello: 'world', intercepted: true })
  }

  @Test()
  public async shouldBeAbleToExecuteATerminateMiddlewareAfterReturningTheRequest({ assert }: Context) {
    let terminated = false

    Server.terminate(() => {
      terminated = true
    }).get({
      url: '/test',
      handler: async ctx => ctx.response.send({ hello: 'world' }),
    })

    const response = await Server.request().get('/test')

    assert.isTrue(terminated)
    assert.deepEqual(response.json(), { hello: 'world' })
  }
}
