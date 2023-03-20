/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fake } from 'sinon'
import { Module } from '@athenna/common'
import { Log, LoggerProvider } from '@athenna/logger'
import { HttpKernel, HttpServerProvider, HttpRouteProvider, Server, Route } from '#src'
import { Test, AfterEach, BeforeEach, TestContext } from '@athenna/test'

export default class HttpKernelTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    await Config.loadAll(Path.stubs('config'))
    new HttpServerProvider().register()
    new HttpRouteProvider().register()
    new LoggerProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    Log.restoreAllMethods()
  }

  @Test()
  public async shouldBeAbleToRegisterTheFastifyCorsPluginInTheHttpServer({ assert }: TestContext) {
    const kernel = new HttpKernel()
    await kernel.registerCors()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ hello: true }) })

    const response = await Server.request().get('hello')

    assert.deepEqual(response.json(), { hello: true })
    assert.containsSubset(response.headers, {
      vary: 'Origin',
      'access-control-expose-headers': '*',
    })
    assert.isTrue(Server.fastify.hasPlugin('@fastify/cors'))
  }

  @Test()
  public async shouldBeAbleToRegisterTheFastifyHelmetPluginInTheHttpServer({ assert }: TestContext) {
    const kernel = new HttpKernel()
    await kernel.registerHelmet()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ hello: true }) })

    const response = await Server.request().get('hello')

    assert.deepEqual(response.json(), { hello: true })
    assert.containsSubset(response.headers, {
      'x-frame-options': 'SAMEORIGIN',
      'x-dns-prefetch-control': 'off',
      'cross-origin-opener-policy': 'same-origin',
      'cross-origin-resource-policy': 'same-origin',
      'cross-origin-embedder-policy': 'require-corp',
      'strict-transport-security': 'max-age=15552000; includeSubDomains',
    })
    assert.isTrue(Server.fastify.hasPlugin('@fastify/helmet'))
  }

  @Test()
  public async shouldBeAbleToRegisterTheFastifySwaggerPluginInTheHttpServer({ assert }: TestContext) {
    const kernel = new HttpKernel()
    await kernel.registerSwagger()

    const response = await Server.request().get('documentation')

    assert.equal(response.statusCode, 302)
    assert.isTrue(Server.fastify.hasPlugin('@fastify/swagger'))
  }

  @Test()
  public async shouldBeAbleToRegisterTheFastifyRateLimitPluginInTheHttpServer({ assert }: TestContext) {
    const kernel = new HttpKernel()
    await kernel.registerRateLimit()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ hello: true }) })

    const response = await Server.request().get('hello')

    assert.containsSubset(response.headers, {
      'x-ratelimit-limit': 1000,
      'x-ratelimit-remaining': 999,
      'x-ratelimit-reset': 60,
    })
    assert.isTrue(Server.fastify.hasPlugin('@fastify/rate-limit'))
  }

  @Test()
  public async shouldBeAbleToRegisterTheFastifyRTTracerPluginInTheHttpServer({ assert }: TestContext) {
    const kernel = new HttpKernel()
    await kernel.registerRTracer()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ traceId: ctx.data.traceId }) })

    const response = await Server.request().get('hello')

    assert.isDefined(response.json().traceId)
    assert.isTrue(Server.fastify.hasPlugin('cls-rtracer'))
  }

  @Test()
  public async shouldBeAbleToRegisterTheLoggerTerminatorInTheHttpServer({ assert }: TestContext) {
    const logInfoFake = fake()
    const kernel = new HttpKernel()
    await kernel.registerLoggerTerminator()
    Log.fakeMethod('channelOrVanilla', logInfoFake)
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ hello: true }) })

    const response = await Server.request().get('hello')

    assert.isTrue(logInfoFake.called)
    assert.deepEqual(response.json(), { hello: true })
  }

  @Test()
  public async shouldBeAbleToRegisterTheFastifyCorsPluginIfTheConfigurationFileDoesNotExist({ assert }: TestContext) {
    const originalSafeImport = Module.safeImport
    Module.safeImport = () => Promise.resolve(null)
    const { HttpKernel } = await import(`../../../src/Kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerCors()
    Module.safeImport = originalSafeImport

    assert.isFalse(Server.fastify.hasPlugin('@fastify/cors'))
  }

  @Test()
  public async shouldNotRegisterTheFastifyHelmetPluginIfTheConfigurationFileDoesNotExist({ assert }: TestContext) {
    const originalSafeImport = Module.safeImport
    Module.safeImport = () => Promise.resolve(null)
    const { HttpKernel } = await import(`../../../src/Kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerHelmet()
    Module.safeImport = originalSafeImport

    assert.isFalse(Server.fastify.hasPlugin('@fastify/helmet'))
  }

  @Test()
  public async shouldNotRegisterTheFastifySwaggerPluginIfTheConfigurationFileDoesNotExist({ assert }: TestContext) {
    const originalSafeImport = Module.safeImport
    Module.safeImport = () => Promise.resolve(null)
    const { HttpKernel } = await import(`../../../src/Kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerSwagger()
    Module.safeImport = originalSafeImport

    assert.isFalse(Server.fastify.hasPlugin('@fastify/swagger'))
  }

  @Test()
  public async shouldNotRegisterTheFastifyRateLimitPluginIfTheConfigurationFileDoesNotExist({ assert }: TestContext) {
    const originalSafeImport = Module.safeImport
    Module.safeImport = () => Promise.resolve(null)
    const { HttpKernel } = await import(`../../../src/Kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerRateLimit()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ hello: true }) })

    const response = await Server.request().get('hello')

    assert.deepEqual(response.json(), { hello: true })
    assert.isFalse(Server.fastify.hasPlugin('@fastify/rate-limit'))
    Module.safeImport = originalSafeImport
  }

  @Test()
  public async shouldNotRegisterTheFastifyRTracerPluginIfTheConfigurationFileDoesNotExist({ assert }: TestContext) {
    const originalSafeImport = Module.safeImport
    Module.safeImport = () => Promise.resolve(null)
    const { HttpKernel } = await import(`../../../src/Kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerRTracer()
    Module.safeImport = originalSafeImport

    assert.isFalse(Server.fastify.hasPlugin('cls-rtracer'))
  }

  @Test()
  public async shouldBeAbleToRegisterControllersOfTheRcFileWithAndWithoutDecorators({ assert }: TestContext) {
    const kernel = new HttpKernel()
    await kernel.registerControllers()

    assert.isFalse(ioc.hasDependency('helloController'))
    assert.isTrue(ioc.hasDependency('App/Http/Controllers/HelloController'))
    assert.equal(ioc.getRegistration('App/Http/Controllers/HelloController').lifetime, 'TRANSIENT')

    assert.isTrue(ioc.hasDependency('decoratedController'))
    assert.isFalse(ioc.hasDependency('App/Http/Controllers/DecoratedController'))
    assert.equal(ioc.getRegistration('decoratedController').lifetime, 'SINGLETON')
  }

  @Test()
  public async shouldBeAbleToRegisterNamedMiddlewaresOfTheRcFileWithAndWithoutDecorators({ assert }: TestContext) {
    const kernel = new HttpKernel()
    await kernel.registerNamedMiddlewares()

    assert.isFalse(ioc.hasDependency('middleware'))
    assert.isTrue(ioc.hasDependency('App/Http/Middlewares/Middleware'))
    assert.isTrue(ioc.hasDependency('App/Http/Interceptors/Interceptor'))
    assert.isTrue(ioc.hasDependency('App/Http/Terminators/Terminator'))
    assert.equal(ioc.getRegistration('App/Http/Middlewares/Middleware').lifetime, 'TRANSIENT')

    assert.isTrue(ioc.hasDependency('decoratedMiddleware'))
    assert.isTrue(ioc.hasDependency('App/Http/Middlewares/Names/middleware'))
    assert.isFalse(ioc.hasDependency('App/Http/Middlewares/Names/not-found-middleware'))
    assert.isFalse(ioc.hasDependency('App/Http/Middlewares/DecoratedMiddleware'))
    assert.equal(ioc.getRegistration('decoratedMiddleware').lifetime, 'SINGLETON')

    assert.isTrue(ioc.hasDependency('decoratedInterceptor'))
    assert.isTrue(ioc.hasDependency('App/Http/Interceptors/Names/interceptor'))
    assert.isFalse(ioc.hasDependency('App/Http/Interceptors/Names/not-found-interceptor'))
    assert.isFalse(ioc.hasDependency('App/Http/Interceptors/DecoratedInterceptor'))
    assert.equal(ioc.getRegistration('decoratedInterceptor').lifetime, 'SINGLETON')

    assert.isTrue(ioc.hasDependency('decoratedTerminator'))
    assert.isTrue(ioc.hasDependency('App/Http/Terminators/Names/terminator'))
    assert.isFalse(ioc.hasDependency('App/Http/Terminators/Names/not-found-terminator'))
    assert.isFalse(ioc.hasDependency('App/Http/Terminators/DecoratedTerminator'))
    assert.equal(ioc.getRegistration('decoratedTerminator').lifetime, 'SINGLETON')
  }

  @Test()
  public async shouldBeAbleToRegisterGlobalMiddlewaresOfTheRcFileWithAndWithoutDecorators({ assert }: TestContext) {
    const kernel = new HttpKernel()
    await kernel.registerGlobalMiddlewares()

    assert.isFalse(ioc.hasDependency('middleware'))
    assert.isTrue(ioc.hasDependency('App/Http/Middlewares/Middleware'))
    assert.isTrue(ioc.hasDependency('App/Http/Interceptors/Interceptor'))
    assert.isTrue(ioc.hasDependency('App/Http/Terminators/Terminator'))
    assert.equal(ioc.getRegistration('App/Http/Middlewares/Middleware').lifetime, 'TRANSIENT')

    assert.isTrue(ioc.hasDependency('decoratedGlobalMiddleware'))
    assert.isFalse(ioc.hasDependency('App/Http/Middlewares/DecoratedMiddleware'))
    assert.equal(ioc.getRegistration('decoratedGlobalMiddleware').lifetime, 'SINGLETON')

    assert.isTrue(ioc.hasDependency('decoratedGlobalInterceptor'))
    assert.isFalse(ioc.hasDependency('App/Http/Interceptors/DecoratedInterceptor'))
    assert.equal(ioc.getRegistration('decoratedGlobalInterceptor').lifetime, 'SINGLETON')

    assert.isTrue(ioc.hasDependency('decoratedGlobalTerminator'))
    assert.isFalse(ioc.hasDependency('App/Http/Terminators/DecoratedTerminator'))
    assert.equal(ioc.getRegistration('decoratedGlobalTerminator').lifetime, 'SINGLETON')
  }

  @Test()
  public async shouldBeAbleToRegisterAllMiddlewaresWithJustOneKernelMethodCall({ assert }: TestContext) {
    const kernel = new HttpKernel()
    await kernel.registerMiddlewares()

    // Named
    assert.isFalse(ioc.hasDependency('middleware'))
    assert.isTrue(ioc.hasDependency('App/Http/Middlewares/Middleware'))
    assert.isTrue(ioc.hasDependency('App/Http/Interceptors/Interceptor'))
    assert.isTrue(ioc.hasDependency('App/Http/Terminators/Terminator'))
    assert.equal(ioc.getRegistration('App/Http/Middlewares/Middleware').lifetime, 'TRANSIENT')
    assert.isTrue(ioc.hasDependency('decoratedMiddleware'))
    assert.isTrue(ioc.hasDependency('App/Http/Middlewares/Names/middleware'))
    assert.isFalse(ioc.hasDependency('App/Http/Middlewares/Names/not-found-middleware'))
    assert.isFalse(ioc.hasDependency('App/Http/Middlewares/DecoratedMiddleware'))
    assert.equal(ioc.getRegistration('decoratedMiddleware').lifetime, 'SINGLETON')
    assert.isTrue(ioc.hasDependency('decoratedInterceptor'))
    assert.isTrue(ioc.hasDependency('App/Http/Interceptors/Names/interceptor'))
    assert.isFalse(ioc.hasDependency('App/Http/Interceptors/Names/not-found-interceptor'))
    assert.isFalse(ioc.hasDependency('App/Http/Interceptors/DecoratedInterceptor'))
    assert.equal(ioc.getRegistration('decoratedInterceptor').lifetime, 'SINGLETON')
    assert.isTrue(ioc.hasDependency('decoratedTerminator'))
    assert.isTrue(ioc.hasDependency('App/Http/Terminators/Names/terminator'))
    assert.isFalse(ioc.hasDependency('App/Http/Terminators/Names/not-found-terminator'))
    assert.isFalse(ioc.hasDependency('App/Http/Terminators/DecoratedTerminator'))
    assert.equal(ioc.getRegistration('decoratedTerminator').lifetime, 'SINGLETON')

    // Globals
    assert.isFalse(ioc.hasDependency('middleware'))
    assert.isTrue(ioc.hasDependency('App/Http/Middlewares/Middleware'))
    assert.isTrue(ioc.hasDependency('App/Http/Interceptors/Interceptor'))
    assert.isTrue(ioc.hasDependency('App/Http/Terminators/Terminator'))
    assert.equal(ioc.getRegistration('App/Http/Middlewares/Middleware').lifetime, 'TRANSIENT')
    assert.isTrue(ioc.hasDependency('decoratedGlobalMiddleware'))
    assert.isFalse(ioc.hasDependency('App/Http/Middlewares/DecoratedMiddleware'))
    assert.equal(ioc.getRegistration('decoratedGlobalMiddleware').lifetime, 'SINGLETON')
    assert.isTrue(ioc.hasDependency('decoratedGlobalInterceptor'))
    assert.isFalse(ioc.hasDependency('App/Http/Interceptors/DecoratedInterceptor'))
    assert.equal(ioc.getRegistration('decoratedGlobalInterceptor').lifetime, 'SINGLETON')
    assert.isTrue(ioc.hasDependency('decoratedGlobalTerminator'))
    assert.isFalse(ioc.hasDependency('App/Http/Terminators/DecoratedTerminator'))
    assert.equal(ioc.getRegistration('decoratedGlobalTerminator').lifetime, 'SINGLETON')

    // By imports
    assert.isTrue(ioc.hasDependency('importedMiddleware'))
    assert.isTrue(ioc.hasDependency('App/Http/Middlewares/Names/importedMiddleware'))
  }

  @Test()
  public async shouldBeAbleToExecuteHttpRequestsThatWillBeInterceptedByGlobalMiddlewaresAndNamedMiddlewares({
    assert,
  }: TestContext) {
    const kernel = new HttpKernel()
    await kernel.registerGlobalMiddlewares()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send(ctx.data) })

    const response = await Server.request().get('hello')

    assert.deepEqual(response.json(), { handled: true, intercepted: true })
  }

  @Test()
  public async shouldBeAbleToRegisterTheDefaultExceptionHandlerForTheServerRequestHandlers({ assert }: TestContext) {
    const kernel = new HttpKernel()
    await kernel.registerExceptionHandler()
    Server.get({
      url: '/hello',
      handler: () => {
        throw new Error('hey')
      },
    })

    const response = await Server.request().get('hello')

    assert.isDefined(response.json().stack)
    assert.containsSubset(response.json(), {
      statusCode: 500,
      code: 'ERROR',
      name: 'Error',
      message: 'hey',
    })
  }

  @Test()
  public async shouldBeAbleToRegisterACustomExceptionHandlerForTheServerRequestHandlers({ assert }: TestContext) {
    const kernel = new HttpKernel()
    await kernel.registerExceptionHandler('#tests/Stubs/handlers/Handler')
    Server.get({
      url: '/hello',
      handler: () => {
        throw new Error('hey')
      },
    })

    const response = await Server.request().get('hello')

    assert.isDefined(response.json().stack)
    assert.containsSubset(response.json(), {
      statusCode: 500,
      code: 'ERROR',
      name: 'Error',
      message: 'hey',
    })
  }

  @Test()
  public async shouldBeAbleToRegisterACustomRouteFile({ assert }: TestContext) {
    const kernel = new HttpKernel()
    await kernel.registerRoutes('#tests/Stubs/routes/http')

    Route.register()

    const response = await Server.request().get('/hello')

    assert.deepEqual(response.json(), {})
  }
}
