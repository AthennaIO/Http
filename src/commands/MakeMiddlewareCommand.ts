/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { BaseCommand, Argument } from '@athenna/artisan'

export class MakeMiddlewareCommand extends BaseCommand {
  @Argument({
    description: 'The middleware name.'
  })
  public name: string

  public static signature(): string {
    return 'make:middleware'
  }

  public static description(): string {
    return 'Make a new middleware file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING MIDDLEWARE ])\n')

    const destination = Config.get(
      'rc.commands.make:middleware.destination',
      Path.middlewares()
    )

    const file = await this.generator
      .fileName(this.name)
      .destination(destination)
      .template('middleware')
      .setNameProperties(true)
      .make()

    this.logger.success(
      `Middleware ({yellow} "${file.name}") successfully created.`
    )

    const importPath = this.generator.getImportPath()

    await this.rc.pushTo('middlewares', importPath).save()

    this.logger.success(
      `Athenna RC updated: ({dim,yellow} [ middlewares += "${importPath}" ])`
    )
  }
}
