/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class BadRequestException extends Exception {
  public constructor(content = 'Bad request exception has occurred') {
    super(content, 400, 'BAD_REQUEST_ERROR')
  }
}
