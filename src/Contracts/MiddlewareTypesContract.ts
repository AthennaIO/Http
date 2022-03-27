/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HandleHandlerContract } from './Context/Middlewares/Handle/HandleHandlerContract'
import { TerminateHandlerContract } from './Context/Middlewares/Terminate/TerminateHandlerContract'
import { InterceptHandlerContract } from './Context/Middlewares/Intercept/InterceptHandlerContract'

export interface MiddlewareTypesContract {
  handlers: HandleHandlerContract[]
  terminators: TerminateHandlerContract[]
  interceptors: InterceptHandlerContract[]
}
