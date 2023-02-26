/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { InterceptHandler } from '#src/Types/Middlewares/MiddlewareHandler'
import { InterceptorContract } from '#src/Contracts/InterceptorContract'

export type InterceptorRouteType =
  | string
  | InterceptHandler
  | InterceptorContract
