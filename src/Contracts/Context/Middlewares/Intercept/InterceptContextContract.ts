/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RequestContract } from '../../RequestContract'
import { ResponseContract } from '../../ResponseContract'
import { NextInterceptContract } from './NextInterceptContract'

export interface InterceptContextContract {
  request: RequestContract
  response: ResponseContract
  params: Record<string, string>
  queries: Record<string, string>
  body: Record<string, any>
  data: Record<string, any>
  next: NextInterceptContract
}
