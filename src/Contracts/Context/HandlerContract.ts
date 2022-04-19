/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ContextContract } from 'src/Contracts/Context/ContextContract'

export interface HandlerContract {
  (ctx: ContextContract): Promise<any> | any
}
