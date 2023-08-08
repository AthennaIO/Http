/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServiceProvider } from '@athenna/ioc'
import { ServerImpl } from '#src/server/ServerImpl'

export class HttpServerProvider extends ServiceProvider {
  public register() {
    this.container.instance('Athenna/Core/HttpServer', new ServerImpl(), false)
  }

  public async shutdown() {
    const Server = this.container.use<ServerImpl>('Athenna/Core/HttpServer')

    if (!Server) {
      return
    }

    if (!Server.isListening) {
      return
    }

    await Server.close()
  }
}
