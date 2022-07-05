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
}
