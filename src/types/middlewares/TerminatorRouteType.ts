/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { TerminatorContract } from '#src/types/contracts/TerminatorContract'
import type { TerminateHandler } from '#src/types/middlewares/MiddlewareHandler'

export type TerminatorRouteType = string | TerminateHandler | TerminatorContract
