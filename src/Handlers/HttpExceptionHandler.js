import { Log } from '@athenna/logger'
import { String } from '@secjs/utils'
import { Config } from '@athenna/config'

export class HttpExceptionHandler {
  /**
   * Error codes that should be ignored by Log.
   *
   * @type {string[]}
   */
  ignoreCodes = []

  /**
   * Error statuses that should be ignored by Log.
   *
   * @type {number[]}
   */
  ignoreStatuses = []

  /**
   * The global exception handler of all HTTP requests.
   *
   * @param ctx
   */
  async handle({ error, response }) {
    const code = error.code || error.name
    const statusCode = error.statusCode || error.status || 500

    const body = {
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
    const isDebugMode = Config.get('app.debug')

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

    if (error.prettify) {
      process.stderr.write((await error.prettify()).concat('\n'))
    } else {
      Log.error(`(${body.statusCode}) ${body.code}: ${body.message}`, {
        formatterConfig: {
          context: 'ExceptionHandler',
        },
      })
    }

    return response.status(statusCode).send(body)
  }
}
