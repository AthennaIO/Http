/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class MiddlewareNotFoundException extends Exception {
  public constructor(middlewareName: string) {
    const content = `Middleware ${middlewareName} not found in ioc container`

    super(
      content,
      500,
      'NOT_FOUND_ERROR',
      `Remember registering your middleware in kernel file`,
    )
  }
}
