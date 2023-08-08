/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Test } from '@athenna/test'
import { Color } from '@athenna/common'
import { Artisan } from '@athenna/artisan'
import type { Context } from '@athenna/test/types'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class RouteListCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToListAllRoutesRegisteredInTheHttpServer({ assert }: Context) {
    const { stderr, stdout } = await Artisan.callInChild('route:list', this.artisan)

    assert.deepEqual(stderr, '')
    assert.deepEqual(
      Color.removeColors(stdout),
      '[ LISTING ROUTES ]\n' +
        '\n' +
        '┌───────────┬───────────┬────────────────────────┬─────────┐\n' +
        '│ Methods   │ Route     │ Name                   │ Handler │\n' +
        '├───────────┼───────────┼────────────────────────┼─────────┤\n' +
        '│ GET|HEAD  │ /hello    │ get::hello             │ closure │\n' +
        '├───────────┼───────────┼────────────────────────┼─────────┤\n' +
        '│ POST      │ /hello    │ post::hello            │ closure │\n' +
        '├───────────┼───────────┼────────────────────────┼─────────┤\n' +
        '│ GET       │ /test     │ HelloController.index  │ index   │\n' +
        '├───────────┼───────────┼────────────────────────┼─────────┤\n' +
        '│ POST      │ /test     │ HelloController.store  │ store   │\n' +
        '├───────────┼───────────┼────────────────────────┼─────────┤\n' +
        '│ GET       │ /test/:id │ HelloController.show   │ show    │\n' +
        '├───────────┼───────────┼────────────────────────┼─────────┤\n' +
        '│ PUT|PATCH │ /test/:id │ HelloController.update │ update  │\n' +
        '├───────────┼───────────┼────────────────────────┼─────────┤\n' +
        '│ DELETE    │ /test/:id │ HelloController.delete │ delete  │\n' +
        '└───────────┴───────────┴────────────────────────┴─────────┘\n',
    )
  }
}
