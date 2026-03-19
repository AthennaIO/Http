/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ZodError } from 'zod'
import { HttpException } from '#src/exceptions/HttpException'

export class ZodValidationException extends HttpException {
  public constructor(error: ZodError) {
    const code = 'E_VALIDATION_ERROR'
    const status = 422
    const message = 'Validation error happened.'
    const details = error.issues

    super({ message, status, code, details })
  }
}
