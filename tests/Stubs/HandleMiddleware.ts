/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { MiddlewareContract } from '../../src/Contracts/MiddlewareContract'
import { HandleContextContract } from '../../src/Contracts/Context/Middlewares/Handle/HandleContextContract'

export class HandleMiddleware implements MiddlewareContract {
  async handle(ctx: HandleContextContract) {
    if (!ctx.data.middlewares) ctx.data.middlewares = []

    ctx.data.middlewares.push('handle')

    return ctx.next()
  }
}
