/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface ResponseContract {
  send(data?: Record<string, any>): Promise<void> | void
  json(data?: Record<string, any>): Promise<void> | void
  status(code: number): this
  removeHeader(header: string): this
  header(header: string, value: any): this
  safeHeader(header: string, value: any): this
  redirectTo(url: string): this
  redirectTo(url: string, statusCode: number): this
}
