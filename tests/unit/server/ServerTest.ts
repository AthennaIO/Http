/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { OtelProvider } from '@athenna/otel'
import { Server, HttpServerProvider } from '#src'
import { context, createContextKey } from '@opentelemetry/api'
import { Test, AfterEach, BeforeEach, type Context, Cleanup } from '@athenna/test'
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks'

const otelCurrentContextBagKey = Symbol.for('athenna.otel.currentContextBag')

export default class ServerTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    context.setGlobalContextManager(new AsyncLocalStorageContextManager().enable())
    new OtelProvider().register()
    new HttpServerProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    context.disable()
    await new OtelProvider().shutdown()
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
  public async shouldReturnNormallyIfTheHttpServerIsNotRunningOnCloseMethod({ assert }: Context) {
    assert.isUndefined(await Server.close())
  }

  @Test()
  public async shouldBeAbleToGetTheFastifyVersionFromTheHttpServer({ assert }: Context) {
    assert.equal(Server.getFastifyVersion(), '5.8.2')
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
      }
    })

    const response = await Server.request().get('/test')

    assert.deepEqual(response.json(), { status: 500, message: 'Something is wrong' })
  }

  @Test()
  public async shouldBeAbleToExecuteAMiddlewareBeforeGoingToTheRouteHandler({ assert }: Context) {
    Server.middleware(async ctx => (ctx.data.handled = true)).get({
      url: '/test',
      handler: async ctx => ctx.response.send({ handled: ctx.data.handled })
    })

    const response = await Server.request().get('/test')

    assert.deepEqual(response.json(), { handled: true })
  }

  @Test()
  public async shouldBeAbleToExecuteAnInterceptMiddlewareBeforeReturningTheRequest({ assert }: Context) {
    Server.intercept(ctx => {
      ctx.response.body.intercepted = true

      return ctx.response.body
    }).get({
      url: '/test',
      handler: async ctx => ctx.response.send({ hello: 'world' })
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
      handler: async ctx => ctx.response.send({ hello: 'world' })
    })

    const response = await Server.request().get('/test')

    assert.isTrue(terminated)
    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldKeepOriginalRequestBodyAvailableAfterInterceptingTheResponse({ assert }: Context) {
    let requestBody: any
    let responseBody: any

    Server.intercept(ctx => {
      return { ...ctx.response.body, intercepted: true }
    })
      .terminate(ctx => {
        requestBody = ctx.request.body
        responseBody = ctx.response.body
      })
      .post({
        url: '/test',
        handler: async ctx => ctx.response.send({ hello: 'world' })
      })

    const response = await Server.request().post('/test').body({ foo: 'bar' })

    assert.deepEqual(response.json(), { hello: 'world', intercepted: true })
    assert.deepEqual(requestBody, { foo: 'bar' })
    assert.deepEqual(responseBody, { hello: 'world', intercepted: true })
  }

  @Test()
  @Cleanup(() => Config.set('http.otel.contextEnabled', false))
  @Cleanup(() => Config.set('http.otel.contextBindings', []))
  public async shouldBindConfiguredOtelContextValuesAcrossTheRequestLifecycle({ assert }: Context) {
    const methodKey = createContextKey('http.method')
    const stageKey = createContextKey('request.stage')
    let terminateValues: any = {}

    Config.set('http.otel.contextEnabled', true)
    Config.set('http.otel.contextBindings', [
      { key: methodKey, resolve: ctx => ctx.request.method },
      { key: stageKey, resolve: ctx => ctx.data.stage }
    ])

    Server.terminate(ctx => {
      terminateValues = {
        method: context.active().getValue(methodKey),
        stage: context.active().getValue(stageKey),
        status: ctx.status
      }
    }).post({
      url: '/test',
      data: { stage: 'route-default' },
      handler: async ctx =>
        ctx.response.send({
          method: context.active().getValue(methodKey),
          stage: context.active().getValue(stageKey)
        })
    })

    const response = await Server.request({ path: '/test', method: 'POST' })

    assert.deepEqual(response.json(), {
      method: 'POST',
      stage: 'route-default'
    })
    assert.deepEqual(terminateValues, {
      method: 'POST',
      stage: 'route-default',
      status: 200
    })
  }

  @Test()
  @Cleanup(() => Config.set('http.otel.contextEnabled', false))
  @Cleanup(() => Config.set('http.otel.contextBindings', []))
  public async shouldCreateAndReuseTheSameRequestContextBagAcrossTheLifecycle({ assert }: Context) {
    const exampleIdKey = 'exampleId'
    let requestBag: Map<string | symbol, unknown> = null
    let terminateBag: Map<string | symbol, unknown> = null

    Config.set('http.otel.contextEnabled', true)
    Config.set('http.otel.contextBindings', [{ key: exampleIdKey, resolve: () => 'example-id-from-binding' }])

    Server.terminate(() => {
      terminateBag = context.active().getValue(otelCurrentContextBagKey as any) as Map<string | symbol, unknown>
    }).get({
      url: '/test',
      handler: async ctx => {
        requestBag = context.active().getValue(otelCurrentContextBagKey as any) as Map<string | symbol, unknown>
        requestBag.set(exampleIdKey, 'example-id-from-handler')

        await ctx.response.send({
          exampleId: requestBag.get(exampleIdKey)
        })
      }
    })

    const response = await Server.request().get('/test')

    assert.deepEqual(response.json(), { exampleId: 'example-id-from-handler' })
    assert.strictEqual(requestBag, terminateBag)
    assert.equal(terminateBag.get(exampleIdKey), 'example-id-from-handler')
  }

  @Test()
  @Cleanup(() => Config.set('http.otel.contextEnabled', false))
  @Cleanup(() => Config.set('http.otel.contextBindings', []))
  public async shouldReuseConfiguredOtelContextValuesInsideErrorHandlers({ assert }: Context) {
    const routeKey = createContextKey('request.route')

    Config.set('http.otel.contextEnabled', true)
    Config.set('http.otel.contextBindings', [{ key: routeKey, resolve: ctx => ctx.request.baseUrl }])

    Server.setErrorHandler(async ctx => {
      await ctx.response.status(500).send({
        route: context.active().getValue(routeKey)
      })
    })

    Server.get({
      url: '/boom',
      handler: async () => {
        throw new Error('boom')
      }
    })

    const response = await Server.request().get('/boom')

    assert.equal(response.statusCode, 500)
    assert.deepEqual(response.json(), { route: '/boom' })
  }

  @Test()
  @Cleanup(() => Config.set('http.otel.contextEnabled', false))
  @Cleanup(() => Config.set('http.otel.contextBindings', []))
  public async shouldExposeTheSameRequestContextBagInsideErrorHandlers({ assert }: Context) {
    let requestBag: Map<string | symbol, unknown> = null
    let errorBag: Map<string | symbol, unknown> = null

    Config.set('http.otel.contextEnabled', true)
    Config.set('http.otel.contextBindings', [{ key: 'exampleId', resolve: () => 'example-id-from-binding' }])

    Server.setErrorHandler(async ctx => {
      errorBag = context.active().getValue(otelCurrentContextBagKey as any) as Map<string | symbol, unknown>

      await ctx.response.status(500).send({
        exampleId: errorBag.get('exampleId')
      })
    })

    Server.get({
      url: '/boom',
      handler: async () => {
        requestBag = context.active().getValue(otelCurrentContextBagKey as any) as Map<string | symbol, unknown>
        requestBag.set('exampleId', 'example-id-from-handler')

        throw new Error('boom')
      }
    })

    const response = await Server.request().get('/boom')

    assert.equal(response.statusCode, 500)
    assert.deepEqual(response.json(), { exampleId: 'example-id-from-handler' })
    assert.strictEqual(requestBag, errorBag)
  }
}
