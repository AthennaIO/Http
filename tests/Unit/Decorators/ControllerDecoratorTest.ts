/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Controller } from '#src'

test.group('ControllerDecoratorTest', group => {
  group.each.setup(() => {
    ioc.reconstruct()
  })

  test('should be able to register controllers in the service provider using decorators', async ({ assert }) => {
    @Controller()
    class _MyController {}

    assert.isTrue(ioc.hasDependency('App/Http/Controllers/_MyController'))
  })

  test('should be able to register controllers in the service provider with different aliases using decorators', async ({
    assert,
  }) => {
    @Controller({ alias: 'App/Services/MyController' })
    class _MyController {}

    assert.isTrue(ioc.hasDependency('App/Services/MyController'))
  })

  test('should be able to register controllers in the service provider with different registration type using decorators', async ({
    assert,
  }) => {
    @Controller({ alias: 'myController', type: 'singleton' })
    class _MyController {}

    assert.equal(ioc.getRegistration('myController').lifetime, 'SINGLETON')
  })
})
