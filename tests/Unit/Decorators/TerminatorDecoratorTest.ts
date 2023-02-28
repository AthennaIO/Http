/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Terminator } from '#src'

test.group('TerminatorDecoratorTest', group => {
  group.each.setup(() => {
    ioc.reconstruct()
  })

  test('should be able to register interceptor in the service provider using decorators', async ({ assert }) => {
    @Terminator()
    class _MyTerminator {}

    assert.isTrue(ioc.hasDependency('App/Http/Terminators/_MyTerminator'))
  })

  test('should be able to register interceptor in the service provider with different aliases using decorators', async ({
    assert,
  }) => {
    @Terminator({ alias: 'App/Services/MyTerminator' })
    class _MyTerminator {}

    assert.isTrue(ioc.hasDependency('App/Services/MyTerminator'))
  })

  test('should be able to register interceptor in the service provider with different registration type using decorators', async ({
    assert,
  }) => {
    @Terminator({ alias: 'myTerminator', type: 'singleton' })
    class _MyTerminator {}

    assert.equal(ioc.getRegistration('myTerminator').lifetime, 'SINGLETON')
  })

  test('should not register the dependency again if the dependency is already registered', async ({ assert }) => {
    @Terminator({ alias: 'myTerminator', type: 'singleton' })
    class _MyTerminator {}

    @Terminator({ alias: 'myTerminator', type: 'transient' })
    class __MyTerminator {}

    assert.equal(ioc.getRegistration('myTerminator').lifetime, 'SINGLETON')
  })
})
