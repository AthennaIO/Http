import { HttpCommandsLoader } from '#src/index'
import { ConsoleKernel, ArtisanLoader } from '@athenna/artisan'

export class Kernel extends ConsoleKernel {
  /**
   * Register the commands for the application.
   *
   * @return {import('#src/index').Command[] | Promise<any[]>}
   */
  get commands() {
    return [...ArtisanLoader.loadCommands(), ...HttpCommandsLoader.loadCommands()]
  }

  get templates() {
    return [...ArtisanLoader.loadTemplates(), ...HttpCommandsLoader.loadTemplates()]
  }
}
