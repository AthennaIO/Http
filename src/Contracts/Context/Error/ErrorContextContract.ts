/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RequestContract } from '../RequestContract'
import { ResponseContract } from '../ResponseContract'

export interface ErrorContextContract {
  request: RequestContract
  response: ResponseContract
  params: Record<string, string>
  queries: Record<string, string>
  data?: Record<string, any>
  error: any
}
