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

export default class InterceptorAnnotationTest extends BaseTest {
  @Test()
  public async shouldBeAbleToPreregisterInterceptorUsingTheInterceptorAnnotation({ assert }: Context) {
    const AnnotatedInterceptor = await this.import('#tests/fixtures/middlewares/AnnotatedInterceptor')

    const metadata = Annotation.getMeta(AnnotatedInterceptor)

    assert.isFalse(metadata.registered)
    assert.isUndefined(metadata.camelAlias)
    assert.equal(metadata.isGlobal, false)
    assert.equal(metadata.type, 'singleton')
    assert.equal(metadata.alias, 'decoratedInterceptor')
    assert.equal(metadata.name, 'App/Http/Interceptors/Names/interceptor')
  }

  @Test()
  @Cleanup(() => ioc.reconstruct())
  public async shouldNotReRegisterTheInterceptorIfItIsAlreadyRegisteredInTheServiceContainer({ assert }: Context) {
    ioc.singleton('decoratedInterceptor', () => {})

    const AnnotatedInterceptor = await this.import('#tests/fixtures/middlewares/AnnotatedInterceptor')

    assert.isFalse(Annotation.isAnnotated(AnnotatedInterceptor))
  }

  @Test()
  @Cleanup(() => ioc.reconstruct())
  public async shouldNotReRegisterTheInterceptorIfItNamedAliasIsAlreadyRegisteredInTheServiceContainer({
    assert
  }: Context) {
    ioc.singleton('App/Http/Interceptors/Names/interceptor', () => {})

    const AnnotatedInterceptor = await this.import('#tests/fixtures/middlewares/AnnotatedInterceptor')

    assert.isFalse(Annotation.isAnnotated(AnnotatedInterceptor))
  }
}
