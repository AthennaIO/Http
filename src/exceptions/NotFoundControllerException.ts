/**
 * @athenna/ioc
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotFoundControllerException extends Exception {
  public constructor(alias: string) {
    super({
      status: 500,
      code: 'E_NOT_FOUND_CONTROLLER_ERROR',
      message: `The controller with ${alias} alias has not been found inside the container.`,
      help: `Remember to register the controller in your .athennarc.json file.`
    })
  }
}
