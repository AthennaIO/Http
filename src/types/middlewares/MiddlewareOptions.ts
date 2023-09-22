/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type MiddlewareOptions = {
  /**
   * The alias that will be used to register the middleware inside
   * the service container.
   *
   * @default App/Http/Middlewares/YourMiddlewareClassName
   */
  alias?: string

  /**
   * The camel alias that will be used as an alias of the real
   * middleware alias. Camel alias is important when you want to
   * work with constructor injection. By default, Athenna doesn't
   * create camel alias for middlewares.
   *
   * @default undefined
   */
  camelAlias?: string

  /**
   * The registration type that will be used to register your middleware
   * inside the service container.
   *
   * @default 'transient'
   */
  type?: 'fake' | 'scoped' | 'singleton' | 'transient'

  /**
   * Set if your middleware is global and should be executed in all requests
   * of your server. If this value is true, Athenna will ignore the "name" property.
   *
   * @default false
   */
  isGlobal?: boolean

  /**
   * Set the name of your middleware to be used inside routes. If "isGlobal" property
   * is true, Athenna will ignore this property. Athenna will always set the default
   * name of your middleware as the middleware class name in camel case format.
   *
   * @default 'yourMiddlewareClassName'
   */
  name?: string
}
