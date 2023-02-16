/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Router } from '#src/Router/Router'
import { ServiceProvider } from '@athenna/ioc'

export class HttpRouteProvider extends ServiceProvider {
  public register() {
    this.container.instance('Athenna/Core/HttpRoute', new Router())
  }
}
