/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Interceptor } from '#src'

test.group('InterceptorDecoratorTest', group => {
  group.each.setup(() => {
    ioc.reconstruct()
  })

  test('should be able to register interceptor in the service provider using decorators', async ({ assert }) => {
    @Interceptor()
    class _MyInterceptor {}

    assert.isTrue(ioc.hasDependency('App/Http/Interceptors/_MyInterceptor'))
  })

  test('should be able to register interceptor in the service provider with different aliases using decorators', async ({
    assert,
  }) => {
    @Interceptor({ alias: 'App/Services/MyInterceptor' })
    class _MyInterceptor {}

    assert.isTrue(ioc.hasDependency('App/Services/MyInterceptor'))
  })

  test('should be able to register interceptor in the service provider with different registration type using decorators', async ({
    assert,
  }) => {
    @Interceptor({ alias: 'myInterceptor', type: 'singleton' })
    class _MyInterceptor {}

    assert.equal(ioc.getRegistration('myInterceptor').lifetime, 'SINGLETON')
  })

  test('should not register the dependency again if the dependency is already registered', async ({ assert }) => {
    @Interceptor({ alias: 'myInterceptor', type: 'singleton' })
    class _MyInterceptor {}

    @Interceptor({ alias: 'myInterceptor', type: 'transient' })
    class __MyInterceptor {}

    assert.equal(ioc.getRegistration('myInterceptor').lifetime, 'SINGLETON')
  })
})
