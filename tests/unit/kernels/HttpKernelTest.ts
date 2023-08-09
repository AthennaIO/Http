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
import { Test, AfterEach, BeforeEach, type Context } from '@athenna/test'
import { HttpKernel, HttpServerProvider, HttpRouteProvider, Server, Route } from '#src'

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
  public async shouldBeAbleToRegisterTheFastifyCorsPluginInTheHttpServer({ assert }: Context) {
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
  public async shouldBeAbleToRegisterTheFastifyHelmetPluginInTheHttpServer({ assert }: Context) {
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
  public async shouldBeAbleToRegisterTheFastifySwaggerPluginInTheHttpServer({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerSwagger()

    const response = await Server.request().get('documentation')

    assert.equal(response.statusCode, 302)
    assert.isTrue(Server.fastify.hasPlugin('@fastify/swagger'))
  }

  @Test()
  public async shouldBeAbleToRegisterTheFastifyRateLimitPluginInTheHttpServer({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerRateLimit()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ hello: true }) })

    const response = await Server.request().get('hello')

    assert.equal(response.headers['x-ratelimit-limit'], '1000')
    assert.equal(response.headers['x-ratelimit-remaining'], '999')
    assert.equal(response.headers['x-ratelimit-reset'], '60')
    assert.isTrue(Server.fastify.hasPlugin('@fastify/rate-limit'))
  }

  @Test()
  public async shouldBeAbleToRegisterTheFastifyRTTracerPluginInTheHttpServer({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerRTracer()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ traceId: ctx.data.traceId }) })

    const response = await Server.request().get('hello')

    assert.isDefined(response.json().traceId)
    assert.isTrue(Server.fastify.hasPlugin('cls-rtracer'))
  }

  @Test()
  public async shouldBeAbleToRegisterTheLoggerTerminatorInTheHttpServer({ assert }: Context) {
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
  public async shouldBeAbleToRegisterTheFastifyCorsPluginIfTheConfigurationFileDoesNotExist({ assert }: Context) {
    const originalSafeImport = Module.safeImport
    Module.safeImport = () => Promise.resolve(null)
    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerCors()
    Module.safeImport = originalSafeImport

    assert.isFalse(Server.fastify.hasPlugin('@fastify/cors'))
  }

  @Test()
  public async shouldNotRegisterTheFastifyHelmetPluginIfTheConfigurationFileDoesNotExist({ assert }: Context) {
    const originalSafeImport = Module.safeImport
    Module.safeImport = () => Promise.resolve(null)
    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerHelmet()
    Module.safeImport = originalSafeImport

    assert.isFalse(Server.fastify.hasPlugin('@fastify/helmet'))
  }

  @Test()
  public async shouldNotRegisterTheFastifySwaggerPluginIfTheConfigurationFileDoesNotExist({ assert }: Context) {
    const originalSafeImport = Module.safeImport
    Module.safeImport = () => Promise.resolve(null)
    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerSwagger()
    Module.safeImport = originalSafeImport

    assert.isFalse(Server.fastify.hasPlugin('@fastify/swagger'))
  }

  @Test()
  public async shouldNotRegisterTheFastifyRateLimitPluginIfTheConfigurationFileDoesNotExist({ assert }: Context) {
    const originalSafeImport = Module.safeImport
    Module.safeImport = () => Promise.resolve(null)
    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerRateLimit()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ hello: true }) })

    const response = await Server.request().get('hello')

    assert.deepEqual(response.json(), { hello: true })
    assert.isFalse(Server.fastify.hasPlugin('@fastify/rate-limit'))
    Module.safeImport = originalSafeImport
  }

  @Test()
  public async shouldNotRegisterTheFastifyRTracerPluginIfTheConfigurationFileDoesNotExist({ assert }: Context) {
    const originalSafeImport = Module.safeImport
    Module.safeImport = () => Promise.resolve(null)
    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerRTracer()
    Module.safeImport = originalSafeImport

    assert.isFalse(Server.fastify.hasPlugin('cls-rtracer'))
  }

  @Test()
  public async shouldBeAbleToRegisterControllersOfTheRcFileWithAndWithoutDecorators({ assert }: Context) {
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
  public async shouldBeAbleToRegisterNamedMiddlewaresOfTheRcFileWithAndWithoutDecorators({ assert }: Context) {
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
  public async shouldBeAbleToRegisterGlobalMiddlewaresOfTheRcFileWithAndWithoutDecorators({ assert }: Context) {
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
  public async shouldBeAbleToRegisterAllMiddlewaresWithJustOneKernelMethodCall({ assert }: Context) {
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
  }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerGlobalMiddlewares()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send(ctx.data) })

    const response = await Server.request().get('hello')

    assert.deepEqual(response.json(), { handled: true, intercepted: true })
  }

  @Test()
  public async shouldBeAbleToRegisterTheDefaultExceptionHandlerForTheServerRequestHandlers({ assert }: Context) {
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
  public async shouldBeAbleToRegisterACustomExceptionHandlerForTheServerRequestHandlers({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerExceptionHandler('#tests/stubs/handlers/Handler')
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
  public async shouldBeAbleToRegisterACustomRouteFile({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerRoutes('#tests/stubs/routes/http')

    Route.register()

    const response = await Server.request().get('/hello')

    assert.deepEqual(response.json(), {})
  }
}
