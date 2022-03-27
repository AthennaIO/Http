/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class CannotDefineGroupException extends Exception {
  public constructor() {
    const content = `Cannot define group name`

    super(content, 500, 'DEFINE_GROUP_ERROR')
  }
}
