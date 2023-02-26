/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { TerminateHandler } from '#src/Types/Middlewares/MiddlewareHandler'
import { TerminatorContract } from '#src/Contracts/TerminatorContract'

export type TerminatorRouteType = string | TerminateHandler | TerminatorContract
