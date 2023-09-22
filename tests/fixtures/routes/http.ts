/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Route } from '#src'
import { MyMiddleware } from '#tests/fixtures/middlewares/MyMiddleware'
import { MyInterceptor } from '#tests/fixtures/middlewares/MyInterceptor'
import { HelloController } from '#tests/fixtures/controllers/HelloController'

ioc.bind('App/Http/Interceptors/Names/interceptor', MyInterceptor)

Route.get('/hello', ctx => ctx.response.send({}))
  .name('get::hello')
  .middleware(new MyMiddleware())
Route.post('/hello', ctx => ctx.response.send({}))
  .name('post::hello')
  .interceptor('interceptor')
Route.resource('test', new HelloController())
