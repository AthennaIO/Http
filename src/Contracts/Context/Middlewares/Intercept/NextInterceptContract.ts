/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface NextInterceptContract {
  (body: Record<string, any>, error?: any): Promise<void> | void
}
