/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class UndefinedMethodException extends Exception {
  public constructor(method: string, className: string) {
    super({
      status: 500,
      code: 'E_UNDEFINED_METHOD',
      message: `The method ${method} is not defined inside your class ${className}.`,
      help: `Remember defining the method ${method} inside your class ${className}.`,
    })
  }
}
