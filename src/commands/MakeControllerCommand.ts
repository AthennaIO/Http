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

export class MakeControllerCommand extends BaseCommand {
  @Argument({
    description: 'The controller name.'
  })
  public name: string

  public static signature(): string {
    return 'make:controller'
  }

  public static description(): string {
    return 'Make a new controller file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING CONTROLLER ])\n')

    const destination = Config.get(
      'rc.commands.make:controller.destination',
      Path.controllers()
    )

    const file = await this.generator
      .fileName(this.name)
      .destination(destination)
      .template('controller')
      .setNameProperties(true)
      .make()

    this.logger.success(
      `Controller ({yellow} "${file.name}") successfully created.`
    )

    const importPath = this.generator.getImportPath()

    await this.rc.pushTo('controllers', importPath).save()

    this.logger.success(
      `Athenna RC updated: ({dim,yellow} [ controllers += "${importPath}" ])`
    )
  }
}
