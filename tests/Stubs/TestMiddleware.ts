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
import { InterceptContextContract } from '../../src/Contracts/Context/Middlewares/Intercept/InterceptContextContract'
import { TerminateContextContract } from '../../src/Contracts/Context/Middlewares/Terminate/TerminateContextContract'

export class TestMiddleware implements MiddlewareContract {
  async handle(ctx: HandleContextContract) {
    ctx.data.param = 'param'
    ctx.request.queries.test = 'middleware'

    ctx.next()
  }

  async intercept(ctx: InterceptContextContract) {
    ctx.data.param = 'param'
    ctx.request.queries.test = 'middleware'

    ctx.next(ctx.body)
  }

  async terminate(ctx: TerminateContextContract) {
    console.log('Terminate middleware executed!')

    ctx.next()
  }
}
