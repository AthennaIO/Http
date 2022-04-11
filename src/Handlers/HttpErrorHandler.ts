/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { String } from '@secjs/utils'
import { Log } from '@athenna/logger'
import { Config } from '@athenna/config'
import { ErrorContextContract } from '../Contracts/Context/Error/ErrorContextContract'

export class HttpErrorHandler {
  static handler({ error, response }: ErrorContextContract) {
    const code = error.code || error.name
    const statusCode = error.statusCode || error.status || 500

    const body: any = {
      statusCode,
      code: String.toSnakeCase(`${code}`).toUpperCase(),
      name: error.name,
      message: error.message,
      stack: error.stack,
    }

    if (error.help) {
      body.help = error.help
    }

    const isInternalServerError = statusCode === 500
    const isDebugMode = Config.get<boolean>('app.debug')

    if (isInternalServerError && !isDebugMode) {
      body.name = 'Internal server error'
      body.message = 'An internal server exception has occurred.'

      delete body.stack
    }

    if (isDebugMode) {
      Log.error(`Error: ${JSON.stringify(body, null, 2)}`, {
        formatterConfig: {
          context: HttpErrorHandler.name,
        },
      })
    }

    return response.status(statusCode).send(body)
  }
}
