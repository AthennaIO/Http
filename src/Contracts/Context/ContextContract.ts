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

export interface ContextContract {
  request: RequestContract
  response: ResponseContract
  data: any
  params: any
  queries: any
}
