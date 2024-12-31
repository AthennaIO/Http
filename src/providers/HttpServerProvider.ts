/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { View } from '@athenna/view'
import { Vite } from '#src/vite/index'
import { EdgeError } from 'edge-error'
import { ServiceProvider } from '@athenna/ioc'
import { ServerImpl } from '#src/server/ServerImpl'

export class HttpServerProvider extends ServiceProvider {
  public register() {
    this.container.instance(
      'Athenna/Core/HttpServer',
      new ServerImpl(Config.get('http.fastify'))
    )
  }

  public boot() {
    View.edge.global('vite', new Vite())
    View.edge.registerTag({
      tagName: 'vite',
      seekable: true,
      block: false,
      compile(parser, buffer, token) {
        /**
         * Ensure an argument is defined
         */
        if (!token.properties.jsArg.trim()) {
          throw new EdgeError(
            'Missing entrypoint name',
            'E_RUNTIME_EXCEPTION',
            {
              filename: token.filename,
              line: token.loc.start.line,
              col: token.loc.start.col
            }
          )
        }

        const parsed = parser.utils.transformAst(
          parser.utils.generateAST(
            token.properties.jsArg,
            token.loc,
            token.filename
          ),
          token.filename,
          parser
        )

        const entrypoints = parser.utils.stringify(parsed)
        const methodCall =
          parsed.type === 'SequenceExpression'
            ? `generateEntryPointsTags${entrypoints}`
            : `generateEntryPointsTags(${entrypoints})`

        buffer.outputExpression(
          `(await state.vite.${methodCall}).join('\\n')`,
          token.filename,
          token.loc.start.line,
          false
        )
      }
    })
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
