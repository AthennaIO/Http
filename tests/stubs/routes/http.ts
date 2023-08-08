/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Route } from '#src'
import { Middleware } from '#tests/stubs/middlewares/Middleware'
import { Interceptor } from '#tests/stubs/middlewares/Interceptor'
import { HelloController } from '#tests/stubs/controllers/HelloController'

ioc.bind('App/Http/Interceptors/Names/interceptor', Interceptor)

Route.get('/hello', ctx => ctx.response.send({}))
  .name('get::hello')
  .middleware(new Middleware())
Route.post('/hello', ctx => ctx.response.send({}))
  .name('post::hello')
  .interceptor('interceptor')
Route.resource('test', new HelloController())
