/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, String } from '@secjs/utils'
import { Artisan, Command, FilePropertiesHelper } from '@athenna/artisan'

export class MakeMiddleware extends Command {
  /**
   * The name and signature of the console command.
   *
   * @return {string}
   */
  get signature() {
    return 'make:middleware <name>'
  }

  /**
   * The console command description.
   *
   * @return {string}
   */
  get description() {
    return 'Make a new middleware file.'
  }

  /**
   * Set additional flags in the commander instance.
   * This method is executed when registering your command.
   *
   * @param {import('commander').Command} commander
   * @return {import('commander').Command}
   */
  addFlags(commander) {
    return commander
      .option(
        '--no-register',
        'Do not register the middleware inside Kernel.',
        true,
      )
      .option('--no-lint', 'Do not run eslint in the middleware.', true)
  }

  /**
   * Execute the console command.
   *
   * @param {string} name
   * @param {any} options
   * @return {Promise<void>}
   */
  async handle(name, options) {
    const resource = 'Middleware'
    const path = Path.http(`Middlewares/${name}.js`)

    this.title(`MAKING ${resource}\n`, 'bold', 'green')

    const file = await this.makeFile(path, 'middleware', options.lint)

    this.success(`${resource} ({yellow} "${file.name}") successfully created.`)

    if (options.register) {
      const path = Path.http('Kernel.js')

      await FilePropertiesHelper.addContentToObjectGetter(
        path,
        'namedMiddlewares',
        `${String.toCamelCase(
          file.name,
        )}: import('#app/Http/Middlewares/${name}')`,
      )

      await Artisan.call(`eslint:fix ${path} --quiet`)
    }
  }
}
