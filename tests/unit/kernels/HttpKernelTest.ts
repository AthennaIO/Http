/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { Path, Module } from '@athenna/common'
import { Log, LoggerProvider } from '@athenna/logger'
import { HttpKernel, HttpServerProvider, HttpRouteProvider, Server, Route } from '#src'
import { Test, Mock, AfterEach, BeforeEach, type Context, Cleanup } from '@athenna/test'

export default class HttpKernelTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    await Config.loadAll(Path.fixtures('config'))
    new HttpServerProvider().register()
    new HttpRouteProvider().register()
    new LoggerProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()
  }

  @Test()
  public async shouldBeAbleToRegisterTheFastifyCorsPluginInTheHttpServer({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerCors()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ hello: true }) })

    const response = await Server.request().get('hello')

    assert.deepEqual(response.json(), { hello: true })
    assert.containsSubset(response.headers, {
      'access-control-expose-headers': '*'
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
      'x-content-type-options': 'nosniff',
      'x-download-options': 'noopen',
      'x-xss-protection': '0'
    })
    assert.isTrue(Server.fastify.hasPlugin('@fastify/helmet'))
  }

  @Test()
  public async shouldBeAbleToRegisterTheFastifyMultipartPluginInTheHttpServer({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerMultipart()

    assert.isTrue(Server.fastify.hasPlugin('@fastify/multipart'))
  }

  @Test()
  public async shouldBeAbleToRegisterTheFastifySwaggerPluginInTheHttpServer({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerSwagger()

    const response = await Server.request().get('documentation')

    assert.equal(response.statusCode, 200)
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
  public async shouldBeAbleToRegisterTheFastifyStaticPluginInTheHttpServer({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerStatic()
    Server.get({ url: '/hello', handler: ctx => ctx.response.sendFile('app.ts') })

    const response = await Server.request().get('hello')

    assert.deepEqual(response.headers['accept-ranges'], 'bytes')
    assert.deepEqual(response.headers['content-type'], 'video/mp2t')
    assert.deepEqual(response.headers['cache-control'], 'public, max-age=0')
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
  public async shouldBeAbleToRegisterTheFastifyVitePluginInTheHttpServer({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerVite()

    assert.isTrue(Server.fastify.hasPlugin('@athenna/vite'))
  }

  @Test()
  public async shouldBeAbleToRegisterTheLoggerTerminatorInTheHttpServer({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerLoggerTerminator()
    Log.when('channelOrVanilla').return(undefined)
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ hello: true }) })

    const response = await Server.request().get('hello')

    assert.called(Log.channelOrVanilla)
    assert.deepEqual(response.json(), { hello: true })
  }

  @Test()
  public async shouldNotRegisterTheFastifyCorsPluginIfThePackageIsNotInstalled({ assert }: Context) {
    Mock.when(Module, 'safeImport').resolve(null)

    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerCors()

    assert.isFalse(Server.fastify.hasPlugin('@fastify/cors'))
  }

  @Test()
  @Cleanup(() => Config.set('http.cors.enabled', true))
  public async shouldNotRegisterTheFastifyCorsPluginIfTheConfigurationIsDisabled({ assert }: Context) {
    Config.set('http.cors.enabled', false)

    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerCors()

    assert.isFalse(Server.fastify.hasPlugin('@fastify/cors'))
  }

  @Test()
  public async shouldNotRegisterTheFastifyHelmetPluginIfThePackageIsNotInstalled({ assert }: Context) {
    Mock.when(Module, 'safeImport').resolve(null)

    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerHelmet()

    assert.isFalse(Server.fastify.hasPlugin('@fastify/helmet'))
  }

  @Test()
  @Cleanup(() => Config.set('http.helmet.enabled', true))
  public async shouldNotRegisterTheFastifyHelmetPluginIfTheConfigurationIsDisabled({ assert }: Context) {
    Config.set('http.helmet.enabled', false)

    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerHelmet()

    assert.isFalse(Server.fastify.hasPlugin('@fastify/helmet'))
  }

  @Test()
  @Cleanup(() => Config.set('http.multipart.enabled', true))
  public async shouldNotRegisterTheFastifyMultipartPluginIfTheConfigurationIsDisabled({ assert }: Context) {
    Config.set('http.multipart.enabled', false)

    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerMultipart()

    assert.isFalse(Server.fastify.hasPlugin('@fastify/multipart'))
  }

  @Test()
  public async shouldNotRegisterTheFastifySwaggerPluginIfThePackageIsNotInstalled({ assert }: Context) {
    Mock.when(Module, 'safeImport').resolve(null)

    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerSwagger()

    assert.isFalse(Server.fastify.hasPlugin('@fastify/swagger'))
  }

  @Test()
  @Cleanup(() => Config.set('http.swagger.enabled', true))
  public async shouldNotRegisterTheFastifySwaggerPluginIfTheConfigurationIsDisabled({ assert }: Context) {
    Config.set('http.swagger.enabled', false)

    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerSwagger()

    assert.isFalse(Server.fastify.hasPlugin('@fastify/swagger'))
  }

  @Test()
  @Cleanup(() => Config.set('http.vite.enabled', true))
  public async shouldNotRegisterTheFastifyVitePluginIfTheConfigurationIsDisabled({ assert }: Context) {
    Config.set('http.vite.enabled', false)

    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerVite()

    assert.isFalse(Server.fastify.hasPlugin('@athenna/vite'))
  }

  @Test()
  public async shouldNotRegisterTheFastifyRateLimitPluginIfThePackageIsNotInstalled({ assert }: Context) {
    Mock.when(Module, 'safeImport').resolve(null)

    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerRateLimit()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ hello: true }) })

    const response = await Server.request().get('hello')

    assert.deepEqual(response.json(), { hello: true })
    assert.isFalse(Server.fastify.hasPlugin('@fastify/rate-limit'))
  }

  @Test()
  public async shouldNotRegisterTheFastifyStaticPluginIfThePackageIsNotInstalled({ assert }: Context) {
    Mock.when(Module, 'safeImport').resolve(null)

    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerStatic()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ hello: true }) })

    const response = await Server.request().get('hello')

    assert.deepEqual(response.json(), { hello: true })
    assert.isFalse(Server.fastify.hasPlugin('@fastify/rate-limit'))
  }

  @Test()
  @Cleanup(() => Config.set('http.rateLimit.enabled', true))
  public async shouldNotRegisterTheFastifyRateLimitPluginIfTheConfigurationIsDisabled({ assert }: Context) {
    Config.set('http.rateLimit.enabled', false)

    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerRateLimit()

    assert.isFalse(Server.fastify.hasPlugin('@fastify/rate-limit'))
  }

  @Test()
  @Cleanup(() => Config.set('http.static.enabled', true))
  public async shouldNotRegisterTheFastifyStaticPluginIfTheConfigurationIsDisabled({ assert }: Context) {
    Config.set('http.static.enabled', false)

    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerStatic()

    assert.isFalse(Server.fastify.hasPlugin('@fastify/static'))
  }

  @Test()
  public async shouldNotRegisterTheFastifyRTracerPluginIfThePackageIsNotInstalled({ assert }: Context) {
    Mock.when(Module, 'safeImport').resolve(null)

    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerRTracer()

    assert.isFalse(Server.fastify.hasPlugin('cls-rtracer'))
  }

  @Test()
  public async shouldNotRegisterTheFastifyRTracerPluginIfTheTraceOptionsIsSetToFalse({ assert }: Context) {
    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerRTracer(false)

    assert.isFalse(Server.fastify.hasPlugin('cls-rtracer'))
  }

  @Test()
  @Cleanup(() => Config.set('http.rTracer.enabled', true))
  public async shouldNotRegisterTheFastifyRTracerPluginIfTheConfigurationIsDisabled({ assert }: Context) {
    Config.set('http.rTracer.enabled', false)

    const { HttpKernel } = await import(`../../../src/kernels/HttpKernel.js?v=${Math.random()}`)
    const kernel = new HttpKernel()
    await kernel.registerRTracer()

    assert.isFalse(Server.fastify.hasPlugin('cls-rtracer'))
  }

  @Test()
  @Cleanup(() => Config.set('http.logger.enabled', true))
  public async shouldNotRegisterTheLoggerTerminatorIfTheConfigIsDisabled({ assert }: Context) {
    Config.set('http.logger.enabled', false)

    const kernel = new HttpKernel()
    await kernel.registerLoggerTerminator()
    Log.when('channelOrVanilla').return(undefined)
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ hello: true }) })

    const response = await Server.request().get('hello')

    assert.notCalled(Log.channelOrVanilla)
    assert.deepEqual(response.json(), { hello: true })
  }

  @Test()
  public async shouldBeAbleToRegisterControllersOfTheRcFileWithAndWithoutAnnotations({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerControllers()

    assert.isFalse(ioc.has('helloController'))
    assert.isTrue(ioc.has('App/Http/Controllers/HelloController'))
    assert.equal(ioc.getRegistration('App/Http/Controllers/HelloController').lifetime, 'TRANSIENT')

    assert.isTrue(ioc.has('decoratedController'))
    assert.isFalse(ioc.has('App/Http/Controllers/AnnotatedController'))
    assert.equal(ioc.getRegistration('decoratedController').lifetime, 'SINGLETON')
  }

  @Test()
  public async shouldBeAbleToRegisterNamedMiddlewaresOfTheRcFileWithAndWithoutAnnotations({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerNamedMiddlewares()

    assert.isFalse(ioc.has('middleware'))
    assert.isTrue(ioc.has('App/Http/Middlewares/MyMiddleware'))
    assert.isTrue(ioc.has('App/Http/Interceptors/MyInterceptor'))
    assert.isTrue(ioc.has('App/Http/Terminators/MyTerminator'))
    assert.equal(ioc.getRegistration('App/Http/Middlewares/MyMiddleware').lifetime, 'TRANSIENT')

    assert.isTrue(ioc.has('App/Http/Middlewares/Names/middleware'))
    assert.isFalse(ioc.has('App/Http/Middlewares/Names/not-found-middleware'))
    assert.isFalse(ioc.has('App/Http/Middlewares/AnnotatedMiddleware'))
    assert.equal(ioc.getRegistration('decoratedMiddleware').lifetime, 'SINGLETON')

    assert.isTrue(ioc.has('App/Http/Interceptors/Names/interceptor'))
    assert.isFalse(ioc.has('App/Http/Interceptors/Names/not-found-interceptor'))
    assert.isFalse(ioc.has('App/Http/Interceptors/AnnotatedInterceptor'))
    assert.equal(ioc.getRegistration('decoratedInterceptor').lifetime, 'SINGLETON')

    assert.isTrue(ioc.has('App/Http/Terminators/Names/terminator'))
    assert.isFalse(ioc.has('App/Http/Terminators/Names/not-found-terminator'))
    assert.isFalse(ioc.has('App/Http/Terminators/AnnotatedTerminator'))
    assert.equal(ioc.getRegistration('decoratedTerminator').lifetime, 'SINGLETON')
  }

  @Test()
  public async shouldBeAbleToRegisterGlobalMiddlewaresOfTheRcFileWithAndWithoutAnnotations({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerGlobalMiddlewares()

    assert.isFalse(ioc.has('middleware'))
    assert.isTrue(ioc.has('App/Http/Middlewares/MyMiddleware'))
    assert.isTrue(ioc.has('App/Http/Interceptors/MyInterceptor'))
    assert.isTrue(ioc.has('App/Http/Terminators/MyTerminator'))
    assert.equal(ioc.getRegistration('App/Http/Middlewares/MyMiddleware').lifetime, 'TRANSIENT')

    assert.isTrue(ioc.has('decoratedGlobalMiddleware'))
    assert.isFalse(ioc.has('App/Http/Middlewares/AnnotatedMiddleware'))
    assert.equal(ioc.getRegistration('decoratedGlobalMiddleware').lifetime, 'SINGLETON')

    assert.isTrue(ioc.has('decoratedGlobalInterceptor'))
    assert.isFalse(ioc.has('App/Http/Interceptors/AnnotatedInterceptor'))
    assert.equal(ioc.getRegistration('decoratedGlobalInterceptor').lifetime, 'SINGLETON')

    assert.isTrue(ioc.has('decoratedGlobalTerminator'))
    assert.isFalse(ioc.has('App/Http/Terminators/AnnotatedTerminator'))
    assert.equal(ioc.getRegistration('decoratedGlobalTerminator').lifetime, 'SINGLETON')
  }

  @Test()
  public async shouldBeAbleToRegisterAllMiddlewaresWithJustOneKernelMethodCall({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerMiddlewares()

    assert.isTrue(ioc.has('App/Http/Middlewares/MyMiddleware'))
    assert.isTrue(ioc.has('App/Http/Interceptors/MyInterceptor'))
    assert.isTrue(ioc.has('App/Http/Terminators/MyTerminator'))
    assert.isTrue(ioc.has('App/Http/Middlewares/Names/myMiddleware'))
    assert.isTrue(ioc.has('App/Http/Interceptors/Names/myInterceptor'))
    assert.isTrue(ioc.has('App/Http/Terminators/Names/myTerminator'))
    assert.equal(ioc.getRegistration('App/Http/Middlewares/MyMiddleware').lifetime, 'TRANSIENT')
    assert.equal(ioc.getRegistration('App/Http/Interceptors/MyInterceptor').lifetime, 'TRANSIENT')
    assert.equal(ioc.getRegistration('App/Http/Terminators/MyTerminator').lifetime, 'TRANSIENT')

    assert.isTrue(ioc.has('decoratedMiddleware'))
    assert.isTrue(ioc.has('decoratedInterceptor'))
    assert.isTrue(ioc.has('decoratedTerminator'))
    assert.isTrue(ioc.has('App/Http/Middlewares/Names/middleware'))
    assert.isTrue(ioc.has('App/Http/Interceptors/Names/interceptor'))
    assert.isTrue(ioc.has('App/Http/Terminators/Names/terminator'))
    assert.isFalse(ioc.has('App/Http/Middlewares/Names/not-found-middleware'))
    assert.isFalse(ioc.has('App/Http/Interceptors/Names/not-found-interceptor'))
    assert.isFalse(ioc.has('App/Http/Terminators/Names/not-found-terminator'))
    assert.equal(ioc.getRegistration('decoratedMiddleware').lifetime, 'SINGLETON')
    assert.equal(ioc.getRegistration('decoratedInterceptor').lifetime, 'SINGLETON')
    assert.equal(ioc.getRegistration('decoratedTerminator').lifetime, 'SINGLETON')

    assert.isTrue(ioc.has('decoratedGlobalMiddleware'))
    assert.isTrue(ioc.has('decoratedGlobalInterceptor'))
    assert.isTrue(ioc.has('decoratedGlobalTerminator'))
    assert.isFalse(ioc.has('App/Http/Middlewares/Names/decoratedGlobalMiddleware'))
    assert.isFalse(ioc.has('App/Http/Interceptors/Names/decoratedGlobalInterceptor'))
    assert.isFalse(ioc.has('App/Http/Terminators/Names/decoratedGlobalTerminator'))
    assert.equal(ioc.getRegistration('decoratedGlobalMiddleware').lifetime, 'SINGLETON')
    assert.equal(ioc.getRegistration('decoratedGlobalInterceptor').lifetime, 'SINGLETON')
    assert.equal(ioc.getRegistration('decoratedGlobalTerminator').lifetime, 'SINGLETON')
  }

  @Test()
  public async shouldBeAbleToExecuteHttpRequestsThatWillBeInterceptedByGlobalMiddlewaresAndNamedMiddlewares({
    assert
  }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerGlobalMiddlewares()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send(ctx.data) })

    const response = await Server.request().get('hello')

    assert.deepEqual(response.json(), { handled: true, intercepted: true })
  }

  @Test()
  public async shouldBeAbleToRegisterTheDefaultExceptionHandlerForTheServerRequestHandlers({ assert }: Context) {
    Log.when('channelOrVanilla').return({
      error: Mock.fake()
    })

    const kernel = new HttpKernel()
    await kernel.registerExceptionHandler()
    Server.get({
      url: '/hello',
      handler: () => {
        throw new Error('hey')
      }
    })

    const response = await Server.request().get('hello')

    assert.isDefined(response.json().stack)
    assert.containsSubset(response.json(), {
      statusCode: 500,
      code: 'ERROR',
      name: 'Error',
      message: 'hey'
    })
  }

  @Test()
  public async shouldBeAbleToRegisterACustomExceptionHandlerForTheServerRequestHandlers({ assert }: Context) {
    Log.when('channelOrVanilla').return({
      error: Mock.fake()
    })

    const kernel = new HttpKernel()
    await kernel.registerExceptionHandler('#tests/fixtures/handlers/Handler')
    Server.get({
      url: '/hello',
      handler: () => {
        throw new Error('hey')
      }
    })

    const response = await Server.request().get('hello')

    assert.isDefined(response.json().stack)
    assert.containsSubset(response.json(), {
      statusCode: 500,
      code: 'ERROR',
      name: 'Error',
      message: 'hey'
    })
  }

  @Test()
  public async shouldBeAbleToRegisterACustomRouteFile({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerRoutes('#tests/fixtures/routes/http')

    Route.register()

    const response = await Server.request().get('/hello')

    assert.deepEqual(response.json(), {})
  }
}
