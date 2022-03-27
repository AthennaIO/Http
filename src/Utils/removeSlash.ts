/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@secjs/utils'

export function removeSlash(url: string | string[]): string | string[] {
  if (url === '/') {
    return url
  }

  const matcher = url => `/${url.replace(/^\//, '').replace(/\/$/, '')}`

  if (Is.Array(url)) {
    return url.map(u => matcher(u))
  }

  return matcher(url)
}
