/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { TerminateContext } from '#src/Types/Contexts/TerminateContext'
import { TerminatorContract } from '#src/Contracts/TerminatorContract'

export class Terminator implements TerminatorContract {
  terminate(_: TerminateContext) {}
}
