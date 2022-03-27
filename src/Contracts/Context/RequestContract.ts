/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface RequestContract {
  ip: string
  method: string
  hostUrl: string
  baseUrl: string
  originalUrl: string
  body: Record<string, any>
  params: Record<string, string>
  queries: Record<string, string>
  headers: Record<string, string>
  param(param: string, defaultValue?: string): string | undefined
  query(query: string, defaultValue?: string): string | undefined
  header(header: string, defaultValue?: string): string | string[] | undefined
  payload(payload: string, defaultValue?: string): any | undefined
}
