/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Terminator, TerminateContext, TerminatorContract } from '#src'

@Terminator({ name: 'terminator', type: 'singleton', alias: 'decoratedTerminator', isGlobal: false })
export class DecoratedTerminator implements TerminatorContract {
  terminate(_: TerminateContext) {}
}
