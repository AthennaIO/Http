/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HandleContextContract } from 'src/Contracts/Context/Middlewares/Handle/HandleContextContract'
import { InterceptContextContract } from 'src/Contracts/Context/Middlewares/Intercept/InterceptContextContract'
import { TerminateContextContract } from 'src/Contracts/Context/Middlewares/Terminate/TerminateContextContract'

export interface MiddlewareContract {
  handle?: (ctx: HandleContextContract) => void | Promise<void>
  intercept?: (ctx: InterceptContextContract) => any | Promise<any>
  terminate?: (ctx: TerminateContextContract) => void | Promise<void>
}
