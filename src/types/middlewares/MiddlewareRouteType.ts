/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { MiddlewareContract } from '#src/types/contracts/MiddlewareContract'
import type { HandleHandler } from '#src/types/middlewares/MiddlewareHandler'

export type MiddlewareRouteType = string | HandleHandler | MiddlewareContract
