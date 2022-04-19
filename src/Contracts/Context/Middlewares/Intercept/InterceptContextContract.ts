/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RequestContract } from 'src/Contracts/Context/RequestContract'
import { ResponseContract } from 'src/Contracts/Context/ResponseContract'

export interface InterceptContextContract {
  request: RequestContract
  response: ResponseContract
  params: any
  queries: any
  body: any
  status: number
  data: any
}
