/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServiceProvider } from '@athenna/ioc'
import { ServerImpl } from '#src/Server/ServerImpl'

export class HttpServerProvider extends ServiceProvider {
  public register() {
    this.container.instance('Athenna/Core/HttpServer', new ServerImpl())
  }

  public async shutdown() {
    const Server = this.container.use('Athenna/Core/HttpServer')

    if (!Server) {
      return
    }

    await Server.close()
  }
}
