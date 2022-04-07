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
  static handler({ error, request, response }: ErrorContextContract) {
    const code = error.code || error.name
    const statusCode = error.statusCode || error.status || 500

    const body = {
      code: String.toSnakeCase(code).toUpperCase(),
      path: request.baseUrl,
      method: request.method,
      status: statusCode <= 399 ? 'SUCCESS' : 'ERROR',
      statusCode: statusCode,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    }

    const isInternalServerError = statusCode === 500
    const isNotDebugMode = !Config.get<boolean>('app.debug')

    if (isInternalServerError && isNotDebugMode) {
      body.error.name = 'Internal server error'
      body.error.message =
        'An internal server exception has occurred. Please contact administration of this service.'

      delete body.error.stack
    }

    new Logger().error(`Error: ${JSON.stringify(body.error, null, 2)}`, {
      context: HttpErrorHandler.name,
    })

    return response.status(statusCode).send(body)
  }
}
