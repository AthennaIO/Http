/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Log } from '@athenna/logger'
import type { ErrorContext } from '#src/types'
import { Is, Json, String } from '@athenna/common'

export class HttpExceptionHandler {
  /**
   * Error codes that should be ignored from logging.
   */
  public get ignoreCodes(): string[] {
    return Config.get('http.logger.ignoreCodes', [])
  }

  /**
   * Error statuses that should be ignored from logging.
   */
  public get ignoreStatuses(): number[] {
    return Config.get('http.logger.ignoreStatuses', [])
  }

  /**
   * The exception handler of all request handlers.
   */
  public async handle({ error, response }: ErrorContext): Promise<void> {
    const body: any = {
      statusCode: Json.copy(error.statusCode) || Json.copy(error.status) || 500,
      code: String.toSnakeCase(
        error.code || error.name || 'E_INTERNAL_SERVER'
      ).toUpperCase(),
      name: Json.copy(error.name),
      message: Json.copy(error.message),
      details: Json.copy(error.details),
      stack: Json.copy(error.stack)
    }

    if (error.help) {
      body.help = Json.copy(error.help)
    }

    const isInternalServerError = Is.Error(error) && !Is.Exception(error)
    const isDebugMode = Config.is('app.debug', true)

    if (isInternalServerError && !isDebugMode) {
      body.code = 'E_INTERNAL_SERVER'
      body.name = 'InternalServerException'
      body.message = 'An internal server exception has occurred.'

      delete body.stack
      delete body.details
    }

    response.status(body.statusCode).send(body)

    if (!this.canBeLogged(error)) {
      return
    }

    if (!Is.Exception(error)) {
      error = error.toAthennaException()
    }

    Log.channelOrVanilla('exception').error(await error.prettify())
  }

  /**
   * Return a boolean indicating if the error can be logged or not.
   */
  private canBeLogged(error: any): boolean {
    if (this.ignoreCodes.includes(error.code)) {
      return false
    }

    if (this.ignoreStatuses.includes(error.status || error.statusCode)) {
      return false
    }

    return true
  }
}
