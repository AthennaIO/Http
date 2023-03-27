/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { sep, resolve, isAbsolute } from 'node:path'
import { BaseCommand, Argument } from '@athenna/artisan'

export class MakeInterceptorCommand extends BaseCommand {
  @Argument({
    description: 'The interceptor name.',
  })
  public name: string

  public static signature(): string {
    return 'make:interceptor'
  }

  public static description(): string {
    return 'Make a new interceptor file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING INTERCEPTOR ])\n')

    const file = await this.generator
      .path(this.getFilePath())
      .template('interceptor')
      .setNameProperties(true)
      .make()

    this.logger.success(
      `Interceptor ({yellow} "${file.name}") successfully created.`,
    )

    const importPath = this.getImportPath(file.name)

    await this.rc.pushTo('middlewares', importPath).save()

    this.logger.success(
      `Athenna RC updated: ({dim,yellow} [ middlewares += "${importPath}" ])`,
    )
  }

  /**
   * Get the file path where it will be generated.
   */
  private getFilePath(): string {
    return this.getDestinationPath().concat(`${sep}${this.name}.${Path.ext()}`)
  }

  /**
   * Get the destination path for the file that will be generated.
   */
  private getDestinationPath(): string {
    let destination = Config.get(
      'rc.commands.make:interceptor.destination',
      Path.http('Interceptors'),
    )

    if (!isAbsolute(destination)) {
      destination = resolve(Path.pwd(), destination)
    }

    return destination
  }

  /**
   * Get the import path that should be registered in RC file.
   */
  private getImportPath(fileName: string): string {
    const destination = this.getDestinationPath()

    return `${destination
      .replace(Path.pwd(), '')
      .replace(/\\/g, '/')
      .replace('/', '#')}/${fileName}`
  }
}
