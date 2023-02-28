/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ErrorContext } from '#src'
import { HttpExceptionHandler } from '#src/Handlers/HttpExceptionHandler'

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
