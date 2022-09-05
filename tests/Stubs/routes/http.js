import { Route } from '#src/Facades/Route'

/*
|--------------------------------------------------------------------------
| Http Routes
|--------------------------------------------------------------------------
|
| Here is where you can register http routes for your application. These
| routes are loaded by the HttpRouteProvider.
|
*/

Route.group(() => {
  Route.get('/', ctx => {
    return ctx.response.status(200)
  })
}).prefix('/api')
