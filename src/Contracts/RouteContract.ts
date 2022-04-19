/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpMethodTypes } from 'src/Contracts/HttpMethodTypes'
import { FastifyHandlerContract } from 'src/Contracts/FastifyHandlerContract'

export interface RouteContract {
  method: HttpMethodTypes
  url: string
  handler: FastifyHandlerContract
  preHandler?: FastifyHandlerContract[]
}
