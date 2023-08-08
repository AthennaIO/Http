/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Terminator } from '#src'
import { Test, BeforeEach } from '@athenna/test'
import type { Context } from '@athenna/test/types'

export default class TerminatorDecoratorTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()
  }

  @Test()
  public async shouldBeAbleToRegisterTerminatorInTheServiceProviderUsingDecorators({ assert }: Context) {
    @Terminator()
    class _MyTerminator {}

    assert.isTrue(ioc.hasDependency('App/Http/Terminators/_MyTerminator'))
  }

  @Test()
  public async shouldBeAbleToRegisterTerminatorInTheServiceProviderWithDifferentAliasesUsingDecorators({
    assert,
  }: Context) {
    @Terminator({ alias: 'App/Services/MyTerminator' })
    class _MyTerminator {}

    assert.isTrue(ioc.hasDependency('App/Services/MyTerminator'))
  }

  @Test()
  public async shouldBeAbleToRegisterTerminatorInTheServiceProviderWithDifferentRegistrationTypeUsingDecorators({
    assert,
  }: Context) {
    @Terminator({ alias: 'myTerminator', type: 'singleton' })
    class _MyTerminator {}

    assert.equal(ioc.getRegistration('myTerminator').lifetime, 'SINGLETON')
  }

  @Test()
  public async shouldNotRegisterTheDependencyAgainIfTheDependencyIsAlreadyRegistered({ assert }: Context) {
    @Terminator({ alias: 'myTerminator', type: 'singleton' })
    class _MyTerminator {}

    @Terminator({ alias: 'myTerminator', type: 'transient' })
    class __MyTerminator {}

    assert.equal(ioc.getRegistration('myTerminator').lifetime, 'SINGLETON')
  }
}
