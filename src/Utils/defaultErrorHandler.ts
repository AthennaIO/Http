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
import { ErrorContextContract } from 'src/Contracts/Context/Error/ErrorContextContract'

export function defaultErrorHandler({
  error,
  request,
  response,
}: ErrorContextContract) {
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

  new Logger()
    .channel('application')
    .error(`Error: ${JSON.stringify(body.error, null, 2)}`, {
      context: 'AthennaErrorHandler',
    })

  response.status(statusCode).send(body)
}
