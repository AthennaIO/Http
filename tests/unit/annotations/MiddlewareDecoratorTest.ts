/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Middleware } from '#src'
import { Test, BeforeEach, type Context } from '@athenna/test'

export default class MiddlewareDecoratorTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()
  }

  @Test()
  public async shouldBeAbleToRegisterMiddlewareInTheServiceProviderUsingDecorators({ assert }: Context) {
    @Middleware()
    class _MyMiddleware {}

    assert.isTrue(ioc.hasDependency('App/Http/Middlewares/_MyMiddleware'))
  }

  @Test()
  public async shouldBeAbleToRegisterMiddlewareInTheServiceProviderWithDifferentAliasesUsingDecorators({
    assert,
  }: Context) {
    @Middleware({ alias: 'App/Services/MyMiddleware' })
    class _MyMiddleware {}

    assert.isTrue(ioc.hasDependency('App/Services/MyMiddleware'))
  }

  @Test()
  public async shouldBeAbleToRegisterMiddlewareInTheServiceProviderWithDifferentRegistrationTypeUsingDecorators({
    assert,
  }: Context) {
    @Middleware({ alias: 'myMiddleware', type: 'singleton' })
    class _MyMiddleware {}

    assert.equal(ioc.getRegistration('myMiddleware').lifetime, 'SINGLETON')
  }

  @Test()
  public async shouldNotRegisterTheDependencyAgainIfTheDependencyIsAlreadyRegistered({ assert }: Context) {
    @Middleware({ alias: 'myMiddleware', type: 'singleton' })
    class _MyMiddleware {}

    @Middleware({ alias: 'myMiddleware', type: 'transient' })
    class __MyMiddleware {}

    assert.equal(ioc.getRegistration('myMiddleware').lifetime, 'SINGLETON')
  }
}
