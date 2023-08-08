/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Interceptor } from '#src'
import { Test, BeforeEach } from '@athenna/test'
import type { Context } from '@athenna/test/types'

export default class InterceptorDecoratorTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()
  }

  @Test()
  public async shouldBeAbleToRegisterInterceptorInTheServiceProviderUsingDecorators({ assert }: Context) {
    @Interceptor()
    class _MyInterceptor {}

    assert.isTrue(ioc.hasDependency('App/Http/Interceptors/_MyInterceptor'))
  }

  @Test()
  public async shouldBeAbleToRegisterInterceptorInTheServiceProviderWithDifferentAliasesUsingDecorators({
    assert,
  }: Context) {
    @Interceptor({ alias: 'App/Services/MyInterceptor' })
    class _MyInterceptor {}

    assert.isTrue(ioc.hasDependency('App/Services/MyInterceptor'))
  }

  @Test()
  public async shouldBeAbleToRegisterInterceptorInTheServiceProviderWithDifferentRegistrationTypeUsingDecorators({
    assert,
  }: Context) {
    @Interceptor({ alias: 'myInterceptor', type: 'singleton' })
    class _MyInterceptor {}

    assert.equal(ioc.getRegistration('myInterceptor').lifetime, 'SINGLETON')
  }

  @Test()
  public async shouldNotRegisterTheDependencyAgainIfTheDependencyIsAlreadyRegistered({ assert }: Context) {
    @Interceptor({ alias: 'myInterceptor', type: 'singleton' })
    class _MyInterceptor {}

    @Interceptor({ alias: 'myInterceptor', type: 'transient' })
    class __MyInterceptor {}

    assert.equal(ioc.getRegistration('myInterceptor').lifetime, 'SINGLETON')
  }
}
