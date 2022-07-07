import { Log } from '@athenna/logger'
import { Config, Exception, String } from '@secjs/utils'

export class HttpExceptionHandler {
  /**
   * Error codes that should be ignored by Log.
   *
   * @type {string[]}
   */
  get ignoreCodes() {
    return []
  }

  /**
   * Error statuses that should be ignored by Log.
   *
   * @type {number[]}
   */
  get ignoreStatuses() {
    return []
  }

  /**
   * The global exception handler of all HTTP requests.
   *
   * @param {import('#src/index').ErrorContextContract} ctx
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

    response.status(statusCode).send(body)

    if (error.prettify) {
      const prettyError = await error.prettify()

      Log.channel('exception').error(prettyError.concat('\n'))

      return
    }

    const exception = new Exception(body.message, body.statusCode, body.code)

    exception.stack = body.stack

    const prettyError = await exception.prettify()

    Log.channel('exception').error(prettyError.concat('\n'))
  }
}
