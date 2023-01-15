/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { String } from '@athenna/common'
import { Log, Logger } from '@athenna/logger'

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
    const isDebugMode = Config.get('app.debug', false)

    if (isInternalServerError && !isDebugMode) {
      body.name = 'Internal server error'
      body.message = 'An internal server exception has occurred.'

      delete body.stack
    }

    if (
      this.ignoreCodes.includes(code) ||
      this.ignoreStatuses.includes(statusCode)
    ) {
      return
    }

    const logger = Config.exists('logging.channels.exception')
      ? Log.channel('exception')
      : Logger.getConsoleLogger({
          level: 'trace',
          streamType: 'stderr',
          formatter: 'none',
        })

    if (!error.prettify) {
      error = error.toAthennaException()
    }

    logger.error((await error.prettify()).concat('\n'))

    return response.status(statusCode).send(body)
  }
}
