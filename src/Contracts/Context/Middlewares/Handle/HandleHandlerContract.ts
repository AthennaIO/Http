/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HandleContextContract } from './HandleContextContract'

export interface HandleHandlerContract {
  (ctx: HandleContextContract): Promise<any> | any
}
