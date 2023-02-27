/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { LoggerProvider } from '@athenna/logger'
import { HttpKernel, HttpServerProvider, Server } from '#src'

test.group('HttpKernelTest', group => {
  group.each.setup(async () => {
    ioc.reconstruct()

    await Config.loadAll(Path.stubs('config'))
    new HttpServerProvider().register()
    new LoggerProvider().register()
  })

  test('should be able to register the @fastify/cors plugin in the http server', async ({ assert }) => {
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
  })

  test('should be able to register the @fastify/helmet plugin in the http server', async ({ assert }) => {
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
  })

  test('should be able to register the @fastify/swagger plugin in the http server', async ({ assert }) => {
    const kernel = new HttpKernel()
    await kernel.registerSwagger()

    const response = await Server.request().get('documentation')

    assert.equal(response.statusCode, 302)
    assert.isTrue(Server.fastify.hasPlugin('@fastify/swagger'))
  })

  test('should be able to register the @fastify/rate-limit plugin in the http server', async ({ assert }) => {
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
  })

  test('should be able to register the rTracer library in the http server', async ({ assert }) => {
    const kernel = new HttpKernel()
    await kernel.registerRTracer()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ traceId: ctx.data.traceId }) })

    const response = await Server.request().get('hello')

    assert.isDefined(response.json().traceId)
    assert.isTrue(Server.fastify.hasPlugin('cls-rtracer'))
  })

  test('should be able to register the logger terminator in the http server', async ({ assert }) => {
    const kernel = new HttpKernel()
    await kernel.registerLoggerTerminator()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send({ hello: true }) })

    const response = await Server.request().get('hello')

    assert.deepEqual(response.json(), { hello: true })
  })

  test('should not register the @fastify/cors plugin if the configuration file does not exist', async ({ assert }) => {
    Config.delete('http.cors')
    const kernel = new HttpKernel()
    await kernel.registerCors()

    assert.isFalse(Server.fastify.hasPlugin('@fastify/cors'))
  })

  test('should not register the @fastify/helmet plugin if the configuration file does not exist', async ({
    assert,
  }) => {
    Config.delete('http.helmet')
    const kernel = new HttpKernel()
    await kernel.registerHelmet()

    assert.isFalse(Server.fastify.hasPlugin('@fastify/helmet'))
  })

  test('should not register the @fastify/swagger plugin if the configuration file does not exist', async ({
    assert,
  }) => {
    Config.delete('http.swagger')
    const kernel = new HttpKernel()
    await kernel.registerSwagger()

    assert.isFalse(Server.fastify.hasPlugin('@fastify/swagger'))
  })

  test('should not register the @fastify/rate-limit plugin if the configuration file does not exist', async ({
    assert,
  }) => {
    Config.delete('http.rateLimit')
    const kernel = new HttpKernel()
    await kernel.registerRateLimit()

    assert.isFalse(Server.fastify.hasPlugin('@fastify/rate-limit'))
  })

  test('should not register the rTracer plugin if the configuration file does not exist', async ({ assert }) => {
    Config.delete('http.rTracer')
    const kernel = new HttpKernel()
    await kernel.registerRTracer()

    assert.isFalse(Server.fastify.hasPlugin('cls-rtracer'))
  })

  test('should be able to register controllers of the rc file with and without decorators', async ({ assert }) => {
    const kernel = new HttpKernel()
    await kernel.registerControllers()

    assert.isFalse(ioc.hasDependency('helloController'))
    assert.isTrue(ioc.hasDependency('App/Http/Controllers/HelloController'))
    assert.equal(ioc.getRegistration('App/Http/Controllers/HelloController').lifetime, 'TRANSIENT')

    assert.isTrue(ioc.hasDependency('decoratedController'))
    assert.isFalse(ioc.hasDependency('App/Http/Controllers/DecoratedController'))
    assert.equal(ioc.getRegistration('decoratedController').lifetime, 'SINGLETON')
  })

  test('should be able to register named middlewares of the rc file with and without decorators', async ({
    assert,
  }) => {
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
  })

  test('should be able to register global middlewares of the rc file with and without decorators', async ({
    assert,
  }) => {
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
  })

  test('should be able to register all middlewares with just one kernel method call', async ({ assert }) => {
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
  })

  test('should be able to execute http requests that will be intercepted by global middlewares', async ({ assert }) => {
    const kernel = new HttpKernel()
    await kernel.registerGlobalMiddlewares()
    Server.get({ url: '/hello', handler: ctx => ctx.response.send(ctx.data) })

    const response = await Server.request().get('hello')

    assert.deepEqual(response.json(), { handled: true, intercepted: true })
  })
})
