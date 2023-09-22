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

export default class ControllerAnnotationTest extends BaseTest {
  @Test()
  public async shouldBeAbleToPreregisterControllersUsingControllerAnnotation({ assert }: Context) {
    const ProductController = await this.import('#tests/fixtures/controllers/ProductController')

    const metadata = Annotation.getMeta(ProductController)

    assert.isFalse(metadata.registered)
    assert.isUndefined(metadata.camelAlias)
    assert.equal(metadata.type, 'transient')
    assert.equal(metadata.alias, 'App/Http/Controllers/ProductController')
  }

  @Test()
  @Cleanup(() => ioc.reconstruct())
  public async shouldNotReRegisterTheControllerIfItIsAlreadyRegisteredInTheServiceContainer({ assert }: Context) {
    ioc.singleton('App/Http/Controllers/ProductController', () => {})

    const ProductController = await this.import('#tests/fixtures/controllers/ProductController')

    assert.isFalse(Annotation.isAnnotated(ProductController))
  }
}
