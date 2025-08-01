/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class RouteListCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToListAllRoutesRegisteredInTheHttpServer({ command }: Context) {
    const output = await command.run('route:list')

    console.log(output.output.stderr)

    output.assertSucceeded()
    output.assertLogged('[ LISTING ROUTES ]')
    output.assertLogged('GET|HEAD')
    output.assertLogged('/hello')
    output.assertLogged('get::hello')
  }
}
