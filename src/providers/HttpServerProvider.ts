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
import type { FastifyServerOptions } from 'fastify'

export class HttpServerProvider extends ServiceProvider {
  public register() {
    const fastifyOptions = Config.get<FastifyServerOptions>('http.fastify')

    this.container.instance('Athenna/Core/HttpServer', new ServerImpl(fastifyOptions))
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
