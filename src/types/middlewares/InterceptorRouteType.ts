/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { InterceptorContract } from '#src/types/contracts/InterceptorContract'
import type { InterceptHandler } from '#src/types/middlewares/MiddlewareHandler'

export type InterceptorRouteType =
  | string
  | InterceptHandler
  | InterceptorContract
