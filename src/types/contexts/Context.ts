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

export type Context = {
  request: Request
  response: Response
  data: any
}

export type RequestHandler = (ctx: Context) => any | Promise<any>
