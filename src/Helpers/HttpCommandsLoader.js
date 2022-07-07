import { join } from 'node:path'
import { Folder, Module } from '@secjs/utils'

export class HttpCommandsLoader {
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
    return new Folder(
      join(Module.createDirname(import.meta.url), '..', '..', 'templates'),
    ).loadSync().files
  }
}
