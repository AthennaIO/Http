/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type ControllerOptions = {
  /**
   * The alias that will be used to register the dependency inside
   * the service provider. Athenna will not create camel alias from
   * the alias set here.
   *
   * @default App/Http/Controllers/YourControllerClassName
   */
  alias?: string

  /**
   * The registration type that will be used to register your controller
   * inside the service provider.
   *
   * @default transient
   */
  type?: 'fake' | 'scoped' | 'singleton' | 'transient'
}
