/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { NextContract } from '../../NextContract'
import { RequestContract } from '../../RequestContract'
import { ResponseContract } from '../../ResponseContract'

export interface TerminateContextContract {
  request: RequestContract
  response: ResponseContract
  data?: any
  params: any
  queries: any
  next: NextContract
}
