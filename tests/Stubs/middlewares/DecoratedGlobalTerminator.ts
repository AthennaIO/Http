/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Terminator, TerminateContext, TerminatorContract } from '#src'

@Terminator({ type: 'singleton', alias: 'decoratedGlobalTerminator', isGlobal: true })
export class DecoratedGlobalTerminator implements TerminatorContract {
  terminate(_: TerminateContext) {}
}
