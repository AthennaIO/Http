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
   * The alias that will be used to register the controller inside
   * the service container.
   *
   * @default App/Http/Controllers/YourControllerClassName
   */
  alias?: string

  /**
   * The camel alias that will be used as an alias of the real
   * controller alias. Camel alias is important when you want to
   * work with constructor injection. By default, Athenna doesn't
   * create camel alias for controllers.
   *
   * @default undefined
   */
  camelAlias?: string

  /**
   * The registration type that will be used to register your controller
   * inside the service container.
   *
   * @default 'transient'
   */
  type?: 'fake' | 'scoped' | 'singleton' | 'transient'
}
