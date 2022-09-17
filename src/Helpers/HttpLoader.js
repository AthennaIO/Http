import { join } from 'node:path'
import { Folder, Module } from '@secjs/utils'

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

    return new Folder(templatesPath).loadSync().getFilesByPattern('**/*.ejs')
  }
}
