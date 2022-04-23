import { Log } from '@athenna/logger'
import { String } from '@secjs/utils'
import { Config } from '@athenna/config'
import { ErrorContextContract } from 'src/Contracts/Context/Error/ErrorContextContract'

export class HttpExceptionHandler {
  /**
   * Set if error logs will come with stack.
   *
   * @protected
   */
  protected addStack = false

  /**
   * Error codes that should be ignored by Log.
   *
   * @protected
   */
  protected ignoreCodes: string[] = []

  /**
   * Error statuses that should be ignored by Log.
   *
   * @protected
   */
  protected ignoreStatuses: string[] = []

  /**
   * The global exception handler of all HTTP requests.
   *
   * @param ctx
   */
  public async handle({ error, response }: ErrorContextContract) {
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

    if (
      this.ignoreCodes.includes(code) ||
      this.ignoreStatuses.includes(statusCode)
    ) {
      return response.status(statusCode).send(body)
    }

    const logConfig = {
      formatterConfig: {
        context: 'ExceptionHandler',
      },
    }

    if (this.addStack) {
      Log.error(
        `[${body.statusCode}] ${body.code}::${body.message}\nStack: ${body.stack}`,
        logConfig,
      )
    } else {
      Log.error(`[${body.statusCode}] ${body.code}::${body.message}`, logConfig)
    }

    return response.status(statusCode).send(body)
  }
}
