/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, String } from '@athenna/common'
import { BaseCommand, Argument } from '@athenna/artisan'

export class MakeMiddlewareCommand extends BaseCommand {
  @Argument({
    description: 'The middleware name.',
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

    const file = await this.generator
      .path(Path.http(`Middlewares/${this.name}.${Path.ext()}`))
      .template('artisan::middleware')
      .setNameProperties(true)
      .make()

    this.logger.success(
      `Middleware ({yellow} "${file.name}") successfully created.`,
    )

    const camelName = String.toCamelCase(file.name)
    const importPath = `#app/Http/Middlewares/${file.name}`

    await this.rc
      .pushTo('services', importPath)
      .setTo('namedMiddlewares', camelName, importPath)
      .save()

    this.logger.success(
      `Athenna RC updated: ({dim,yellow} [ services += "${importPath}" ])`,
    )
    this.logger.success(
      `Athenna RC updated: ({dim,yellow} { namedMiddlewares += "${camelName}": "${importPath}" })`,
    )
  }
}
