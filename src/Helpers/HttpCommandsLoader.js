export class HttpCommandsLoader {
  /**
   * Return all commands from http package.
   *
   * @return {any[]}
   */
  static loadCommands() {
    return [
      import('#src/Commands/Route/List.js'),
      import('#src/Commands/Make/Controller.js'),
      import('#src/Commands/Make/Middleware.js'),
    ]
  }
}
