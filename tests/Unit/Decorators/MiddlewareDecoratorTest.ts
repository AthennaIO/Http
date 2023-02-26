/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Middleware } from '#src'

test.group('MiddlewareDecoratorTest', group => {
  group.each.setup(() => {
    ioc.reconstruct()
  })

  test('should be able to register middlewares in the service provider using decorators', async ({ assert }) => {
    @Middleware()
    class _MyMiddleware {}

    assert.isTrue(ioc.hasDependency('App/Http/Middlewares/_MyMiddleware'))
  })

  test('should be able to register middlewares in the service provider with different aliases using decorators', async ({
    assert,
  }) => {
    @Middleware({ alias: 'App/Services/MyMiddleware' })
    class _MyMiddleware {}

    assert.isTrue(ioc.hasDependency('App/Services/MyMiddleware'))
  })

  test('should be able to register middlewares in the service provider with different registration type using decorators', async ({
    assert,
  }) => {
    @Middleware({ alias: 'myMiddleware', type: 'singleton' })
    class _MyMiddleware {}

    assert.equal(ioc.getRegistration('myMiddleware').lifetime, 'SINGLETON')
  })

  test('should not register the dependency again if the dependency is already registered', async ({ assert }) => {
    @Middleware({ alias: 'myMiddleware', type: 'singleton' })
    class _MyMiddleware {}

    @Middleware({ alias: 'myMiddleware', type: 'transient' })
    class __MyMiddleware {}

    assert.equal(ioc.getRegistration('myMiddleware').lifetime, 'SINGLETON')
  })
})
