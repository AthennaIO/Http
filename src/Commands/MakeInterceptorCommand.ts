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
      .path(Path.http(`Interceptors/${this.name}.${Path.ext()}`))
      .template('artisan::interceptor')
      .setNameProperties(true)
      .make()

    this.logger.success(
      `Interceptor ({yellow} "${file.name}") successfully created.`,
    )

    const importPath = `#app/Http/Interceptors/${file.name}`

    await this.rc.pushTo('middlewares', importPath).save()

    this.logger.success(
      `Athenna RC updated: ({dim,yellow} [ middlewares += "${importPath}" ])`,
    )
  }
}
