/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Http } from 'src/Http'
import { ServiceProvider } from '@athenna/ioc'

export class HttpServerProvider extends ServiceProvider {
  boot() {}

  register() {
    this.container.singleton('Athenna/Core/HttpServer', new Http())
  }
}
