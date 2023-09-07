/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { TerminateContext, TerminatorContract } from '#src/types'

export class Terminator implements TerminatorContract {
  terminate(_: TerminateContext) {}
}
