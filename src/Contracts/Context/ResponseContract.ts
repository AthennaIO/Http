import { FastifyReply } from 'fastify'

/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface ResponseContract {
  send(data?: any): Promise<void> | void

  json(data?: any): Promise<void> | void

  status(code: number): this

  removeHeader(header: string): this

  header(header: string, value: any): this

  safeHeader(header: string, value: any): this

  redirectTo(url: string): Promise<void> | void

  redirectTo(url: string, statusCode: number): Promise<void> | void

  getFastifyResponse(): FastifyReply
}
