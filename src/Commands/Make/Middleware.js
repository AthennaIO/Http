/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { Folder, Path, String } from '@secjs/utils'
import { Artisan, Command, TemplateHelper } from '@athenna/artisan'

export class MakeMiddleware extends Command {
  /**
   * The name and signature of the console command.
   */
  signature = 'make:middleware <name>'

  /**
   * The console command description.
   */
  description = 'Make a new middleware file.'

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
    TemplateHelper.setTemplatesFolder(
      new Folder(join(__dirname, '..', '..', '..', 'templates')).loadSync(),
    )

    const resource = 'Middleware'
    const subPath = Path.app(`Http/${String.pluralize(resource)}`)

    this.simpleLog(
      `[ MAKING ${resource.toUpperCase()} ]\n`,
      'rmNewLineStart',
      'bold',
      'green',
    )

    const file = await TemplateHelper.getResourceFile(name, resource, subPath)

    this.success(`${resource} ({yellow} "${file.name}") successfully created.`)

    if (options.lint) {
      await Artisan.call(`eslint:fix ${file.path} --resource ${resource}`)
    }

    if (options.register) {
      await TemplateHelper.replaceObjectProperty(
        Path.http('Kernel.js'),
        'namedMiddlewares =',
        file.name,
        `#app/Http/Middlewares/${file.name}`,
      )
    }

    TemplateHelper.setOriginalTemplatesFolder()
  }
}
