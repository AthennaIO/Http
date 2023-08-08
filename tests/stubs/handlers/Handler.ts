/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ErrorContext } from '#src/types'
import { HttpExceptionHandler } from '#src/handlers/HttpExceptionHandler'

export class Handler extends HttpExceptionHandler {
  public get ignoreCodes(): string[] {
    return ['E_IGNORE_THIS']
  }

  public get ignoreStatuses(): number[] {
    return [248]
  }

  public async handle(ctx: ErrorContext): Promise<void> {
    return super.handle(ctx)
  }
}
