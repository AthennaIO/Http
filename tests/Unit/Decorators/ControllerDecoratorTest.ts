/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Controller } from '#src'
import { Test, BeforeEach, TestContext } from '@athenna/test'

export default class ControllerDecoratorTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()
  }

  @Test()
  public async shouldBeAbleToRegisterControllersInTheServiceProviderUsingDecorators({ assert }: TestContext) {
    @Controller()
    class _MyController {}

    assert.isTrue(ioc.hasDependency('App/Http/Controllers/_MyController'))
  }

  @Test()
  public async shouldBeAbleToRegisterControllersInTheServiceProviderWithDifferentAliasesUsingDecorators({
    assert,
  }: TestContext) {
    @Controller({ alias: 'App/Services/MyController' })
    class _MyController {}

    assert.isTrue(ioc.hasDependency('App/Services/MyController'))
  }

  @Test()
  public async shouldBeAbleToRegisterControllersInTheServiceProviderWithDifferentRegistrationTypeUsingDecorators({
    assert,
  }: TestContext) {
    @Controller({ alias: 'myController', type: 'singleton' })
    class _MyController {}

    assert.equal(ioc.getRegistration('myController').lifetime, 'SINGLETON')
  }

  @Test()
  public async shouldNotRegisterTheDependencyAgainIfTheDependencyIsAlreadyRegistered({ assert }: TestContext) {
    @Controller({ alias: 'myController', type: 'singleton' })
    class _MyController {}

    @Controller({ alias: 'myController', type: 'transient' })
    class __MyController {}

    assert.equal(ioc.getRegistration('myController').lifetime, 'SINGLETON')
  }
}
