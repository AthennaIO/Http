/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Context } from '#src/Types/Contexts/Context'
import { MiddlewareContract } from '#src/Contracts/MiddlewareContract'

export class Middleware implements MiddlewareContract {
  handle(ctx: Context): any {
    ctx.data.handled = true
  }
}
