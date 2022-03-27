/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { MiddlewareContract } from '../../src/Contracts/MiddlewareContract'
import { InterceptContextContract } from '../../src/Contracts/Context/Middlewares/Intercept/InterceptContextContract'

export class InterceptMiddleware implements MiddlewareContract {
  async intercept(ctx: InterceptContextContract) {
    if (!ctx.body.middlewares) ctx.body.middlewares = []

    ctx.body.middlewares.push('intercept')

    ctx.next(ctx.body)
  }
}
