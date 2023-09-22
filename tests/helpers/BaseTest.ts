/**
 * @athenna/ioc
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Ioc } from '@athenna/ioc'
import { Module } from '@athenna/common'
import { AfterEach } from '@athenna/test'

export class BaseTest {
  @AfterEach()
  public baseAfterEach() {
    new Ioc().reconstruct()
  }

  public async import(module: string) {
    return Module.get(import(`${module}.js?version=${Math.random()}`))
  }
}
