/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { String } from '@secjs/utils'
import { Logger } from '@athenna/logger'
import { Config } from '@athenna/config'
import { ErrorContextContract } from '../Contracts/Context/Error/ErrorContextContract'

export class HttpErrorHandler {
  static handler({ error, response }: ErrorContextContract) {
    const code = error.code || error.name
    const statusCode = error.statusCode || error.status || 500

    const body: any = {
      error: {
        statusCode,
        code: String.toSnakeCase(code).toUpperCase(),
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    }

    if (error.help) {
      body.error.help = error.help
    }

    const isInternalServerError = statusCode === 500
    const isDebugMode = !Config.get<boolean>('app.debug')

    if (isInternalServerError && !isDebugMode) {
      body.error.name = 'Internal server error'
      body.error.message = 'An internal server exception has occurred.'

      delete body.error.stack
    }

    if (!isDebugMode) {
      new Logger().error(`Error: ${JSON.stringify(body.error, null, 2)}`, {
        formatterConfig: {
          context: HttpErrorHandler.name,
        },
      })
    }

    return response.status(statusCode).send(body)
  }
}
