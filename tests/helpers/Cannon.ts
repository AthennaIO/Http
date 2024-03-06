/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import autocannon from 'autocannon'

export class Cannon {
  public static coolOff() {
    return new Promise(resolve => setTimeout(resolve, 2000))
  }

  public static run(url: string) {
    return new Promise(resolve => {
      autocannon.track(
        autocannon(
          {
            url,
            connections: 100,
            duration: 40,
            pipelining: 10
          },
          resolve
        )
      )
    })
  }
}
