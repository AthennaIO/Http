/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { Folder, Module } from '@athenna/common'

export class HttpLoader {
  /**
   * Return all commands from http package.
   *
   * @return {any[]}
   */
  static loadCommands() {
    return [
      import('#src/Commands/Route/List'),
      import('#src/Commands/Make/Controller'),
      import('#src/Commands/Make/Middleware'),
    ]
  }

  /**
   * Return all custom templates from http package.
   *
   * @return {any[]}
   */
  static loadTemplates() {
    const dirname = Module.createDirname(import.meta.url)
    const templatesPath = join(dirname, '..', '..', 'templates')

    return new Folder(templatesPath).loadSync().getFilesByPattern('**/*.edge')
  }
}
