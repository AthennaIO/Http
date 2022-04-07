/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RequestContract } from '../../RequestContract'

export interface InterceptContextContract {
  request: RequestContract
  params: any
  queries: any
  body: any
  status: number
  data: Record<string, any>
}
