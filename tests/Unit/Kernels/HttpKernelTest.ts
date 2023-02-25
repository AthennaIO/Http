/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { HttpKernel, HttpServerProvider, Server } from '#src'

test.group('HttpKernelTest', group => {
  group.each.setup(async () => {
    ioc.reconstruct()

    await Config.loadAll(Path.stubs('config'))
    new HttpServerProvider().register()
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
