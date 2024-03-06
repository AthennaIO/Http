/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import chalk from 'chalk'

import { oraPromise } from 'ora'

export class Logger {
  public static line() {
    console.log()
  }

  public static title(message: string) {
    console.log(`${chalk.bgRed.yellow.bold(message)}\n`)
  }

  public static async spinner(promise: any, text: string) {
    await oraPromise(promise, {
      text,
      spinner: 'bouncingBar'
    })
  }
}
