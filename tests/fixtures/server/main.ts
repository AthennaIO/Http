import { Route, Server, HttpServerProvider, HttpRouteProvider } from '#src'

new HttpServerProvider().register()
new HttpRouteProvider().register()

Route.get('/', ctx => {
  return ctx.response.status(200).send({ status: 'ok' })
})

Route.register()

await Server.listen({ port: 3330 })
