/**
 * @athenna/ioc
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotFoundMiddlewareException extends Exception {
  public constructor(alias: string, namedAlias: string) {
    super({
      status: 500,
      code: 'E_NOT_FOUND_MIDDLEWARE_ERROR',
      message: `The middleware with ${namedAlias} named alias and ${alias} alias has not been found inside the container.`,
      help: `Remember to register the middleware in your .athennarc.json file.`
    })
  }
}
