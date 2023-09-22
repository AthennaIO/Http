/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Terminator } from '#src'
import type { TerminateContext, TerminatorContract } from '#src/types'

@Terminator({ type: 'singleton', alias: 'decoratedGlobalTerminator', isGlobal: true })
export class AnnotatedGlobalTerminator implements TerminatorContract {
  public terminate(_: TerminateContext) {}
}
