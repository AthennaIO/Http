/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { TerminateContext } from '#src/types/contexts/TerminateContext'

export interface TerminatorContract {
  /**
   * Handle the request after the response has been sent.
   */
  terminate(ctx: TerminateContext): any | Promise<any>
}
