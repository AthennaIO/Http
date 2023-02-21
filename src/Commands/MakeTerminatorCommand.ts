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

export class MakeTerminatorCommand extends BaseCommand {
  @Argument({
    description: 'The terminator name.',
  })
  public name: string

  public static signature(): string {
    return 'make:terminator'
  }

  public static description(): string {
    return 'Make a new terminator file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING TERMINATOR ])\n')

    const file = await this.generator
      .path(Path.http(`Terminators/${this.name}.${Path.ext()}`))
      .template('artisan::terminator')
      .setNameProperties(true)
      .make()

    this.logger.success(
      `Terminator ({yellow} "${file.name}") successfully created.`,
    )

    const camelName = String.toCamelCase(file.name)
    const importPath = `#app/Http/Terminators/${file.name}`

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
