/**
 * @athenna/logger
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class UndefinedMethodException extends Exception {
  /**
   * Creates a new instance of UndefinedMethodException.
   *
   * @param {string} method
   * @param {string} className
   * @return {UndefinedMethodException}
   */
  constructor(method, className) {
    const content = `The method ${method} is not defined inside your class ${className}.`

    super(
      content,
      500,
      'E_UNDEFINED_METHOD',
      `Remember defining the method ${method} inside your class ${className}`,
    )
  }
}
