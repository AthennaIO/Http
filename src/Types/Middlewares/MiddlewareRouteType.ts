/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HandleHandler } from '#src/Types/Middlewares/MiddlewareHandler'
import { MiddlewareContract } from '#src/Contracts/Middlewares/MiddlewareContract'

export type MiddlewareRouteType = string | HandleHandler | MiddlewareContract
