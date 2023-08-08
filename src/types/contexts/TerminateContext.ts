/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Request } from '#src/context/Request'
import { Response } from '#src/context/Response'

export type TerminateContext = {
  request: Request
  response: Response
  data: any
  body: any
  params: any
  queries: any
  headers: any
  status: number
  responseTime: number
}
