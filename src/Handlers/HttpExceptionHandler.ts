/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ErrorContext } from '#src'
import { Log } from '@athenna/logger'
import { String } from '@athenna/common'

export class HttpExceptionHandler {
  /**
   * Error codes that should be ignored from logging.
   */
  public get ignoreCodes(): string[] {
    return []
  }

  /**
   * Error statuses that should be ignored from logging.
   */
  public get ignoreStatuses(): number[] {
    return []
  }

  /**
   * The exception handler of all request handlers.
   */
  public async handle({ error, response }: ErrorContext): Promise<void> {
    const body: any = {
      statusCode: error.statusCode || error.status || 500,
      code: String.toSnakeCase(error.code || error.name).toUpperCase(),
      name: error.name,
      message: error.message,
      stack: error.stack,
    }

    if (error.help) {
      body.help = error.help
    }

    const isInternalServerError = this.isInternalServerError(error)
    const isDebugMode = Config.is('app.debug', true)

    if (isInternalServerError && !isDebugMode) {
      body.code = 'E_INTERNAL_SERVER'
      body.name = 'InternalServerException'
      body.message = 'An internal server exception has occurred.'

      delete body.stack
    }

    response.status(body.statusCode).send(body)

    if (!this.canBeLogged(error)) {
      return
    }

    if (!error.prettify) {
      error = error.toAthennaException()
    }

    Log.channelOrVanilla('exception').error(
      (await error.prettify()).concat('\n'),
    )
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

  /**
   * Returns a boolean indicating if the error is an internal server error.
   */
  private isInternalServerError(error: any): boolean {
    return [
      'Error',
      'URIError',
      'TypeError',
      'EvalError',
      'RangeError',
      'SyntaxError',
      'InternalError',
      'ReferenceError',
    ].includes(error.name)
  }
}
