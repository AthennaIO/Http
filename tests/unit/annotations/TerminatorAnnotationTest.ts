/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Annotation } from '@athenna/ioc'
import { BaseTest } from '#tests/helpers/BaseTest'
import { Test, type Context, Cleanup } from '@athenna/test'

export default class TerminatorAnnotationTest extends BaseTest {
  @Test()
  public async shouldBeAbleToPreregisterTerminatorUsingTheTerminatorAnnotation({ assert }: Context) {
    const AnnotatedTerminator = await this.import('#tests/fixtures/middlewares/AnnotatedTerminator')

    const metadata = Annotation.getMeta(AnnotatedTerminator)

    assert.isFalse(metadata.registered)
    assert.isUndefined(metadata.camelAlias)
    assert.equal(metadata.isGlobal, false)
    assert.equal(metadata.type, 'singleton')
    assert.equal(metadata.alias, 'decoratedTerminator')
    assert.equal(metadata.name, 'App/Http/Terminators/Names/terminator')
  }

  @Test()
  @Cleanup(() => ioc.reconstruct())
  public async shouldNotReRegisterTheTerminatorIfItIsAlreadyRegisteredInTheServiceContainer({ assert }: Context) {
    ioc.singleton('decoratedTerminator', () => {})

    const AnnotatedTerminator = await this.import('#tests/fixtures/middlewares/AnnotatedTerminator')

    assert.isFalse(Annotation.isAnnotated(AnnotatedTerminator))
  }

  @Test()
  @Cleanup(() => ioc.reconstruct())
  public async shouldNotReRegisterTheTerminatorIfItNamedAliasIsAlreadyRegisteredInTheServiceContainer({
    assert
  }: Context) {
    ioc.singleton('App/Http/Terminators/Names/terminator', () => {})

    const AnnotatedTerminator = await this.import('#tests/fixtures/middlewares/AnnotatedTerminator')

    assert.isFalse(Annotation.isAnnotated(AnnotatedTerminator))
  }
}
