/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Context } from '#src/types/contexts/Context'
import type { InterceptContext } from '#src/types/contexts/InterceptContext'
import type { TerminateContext } from '#src/types/contexts/TerminateContext'

export type HandleHandler = (ctx: Context) => any | Promise<any>
export type InterceptHandler = (
  ctx: InterceptContext,
) =>
  | string
  | Record<string, any>
  | Record<string, any>[]
  | Promise<string>
  | Promise<Record<string, any>>
  | Promise<Record<string, any>[]>
export type TerminateHandler = (ctx: TerminateContext) => any | Promise<any>

export type MiddlewareHandler =
  | HandleHandler
  | TerminateHandler
  | InterceptHandler

export type MiddlewareRecord = {
  middlewares: HandleHandler[]
  terminators: TerminateHandler[]
  interceptors: InterceptHandler[]
}
