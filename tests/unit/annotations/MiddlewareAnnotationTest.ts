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

export default class MiddlewareAnnotationTest extends BaseTest {
  @Test()
  public async shouldBeAbleToPreregisterMiddlewareUsingTheMiddlewareAnnotation({ assert }: Context) {
    const AnnotatedMiddleware = await this.import('#tests/fixtures/middlewares/AnnotatedMiddleware')

    const metadata = Annotation.getMeta(AnnotatedMiddleware)

    assert.isFalse(metadata.registered)
    assert.isUndefined(metadata.camelAlias)
    assert.equal(metadata.isGlobal, false)
    assert.equal(metadata.type, 'singleton')
    assert.equal(metadata.alias, 'decoratedMiddleware')
    assert.equal(metadata.name, 'App/Http/Middlewares/Names/middleware')
  }

  @Test()
  @Cleanup(() => ioc.reconstruct())
  public async shouldNotReRegisterTheMiddlewareIfItIsAlreadyRegisteredInTheServiceContainer({ assert }: Context) {
    ioc.singleton('decoratedMiddleware', () => {})

    const AnnotatedMiddleware = await this.import('#tests/fixtures/middlewares/AnnotatedMiddleware')

    assert.isFalse(Annotation.isAnnotated(AnnotatedMiddleware))
  }

  @Test()
  @Cleanup(() => ioc.reconstruct())
  public async shouldNotReRegisterTheMiddlewareIfItNamedAliasIsAlreadyRegisteredInTheServiceContainer({
    assert
  }: Context) {
    ioc.singleton('App/Http/Middlewares/Names/middleware', () => {})

    const AnnotatedMiddleware = await this.import('#tests/fixtures/middlewares/AnnotatedMiddleware')

    assert.isFalse(Annotation.isAnnotated(AnnotatedMiddleware))
  }
}
