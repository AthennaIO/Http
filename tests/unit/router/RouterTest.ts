/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Context } from '@athenna/test/types'
import { Test, AfterEach, BeforeEach } from '@athenna/test'
import { Middleware } from '#tests/stubs/middlewares/Middleware'
import { Terminator } from '#tests/stubs/middlewares/Terminator'
import { Interceptor } from '#tests/stubs/middlewares/Interceptor'
import { HelloController } from '#tests/stubs/controllers/HelloController'
import { Route, Server, HttpRouteProvider, HttpServerProvider } from '#src'
import { UndefinedMethodException } from '#src/exceptions/UndefinedMethodException'

export default class RouterTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    new HttpServerProvider().register()
    new HttpRouteProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    await new HttpServerProvider().shutdown()
  }

  @Test()
  public async shouldBeAbleToListTheRouteRegisteredInTheRouteClass({ assert }: Context) {
    Route.get('/test', ctx => ctx.response.send({ hello: 'world' }))

    const [route] = Route.list()

    assert.deepEqual(route.url, '/test')
    assert.deepEqual(route.methods, ['GET', 'HEAD'])
    assert.deepEqual(route.middlewares, {
      middlewares: [],
      terminators: [],
      interceptors: [],
    })
    assert.deepEqual(route.fastify, { schema: {} })
  }

  @Test()
  public async shouldBeAbleToRegisterVanillaFastifyRoutesUsingRouteClass({ assert }: Context) {
    Route.vanillaRoute({ url: '/test', handler: (_, res) => res.send({ hello: 'world' }), method: ['GET'] })

    const response = await Server.request({ path: '/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAGetRouteInTheHttpServerUsingRouteClass({ assert }: Context) {
    Route.get('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAHeadRouteInTheHttpServerUsingRouteClass({ assert }: Context) {
    Route.head('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'head' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAPostRouteInTheHttpServerUsingRouteClass({ assert }: Context) {
    Route.post('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'post' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAPutRouteInTheHttpServerUsingRouteClass({ assert }: Context) {
    Route.put('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'put' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAPatchRouteInTheHttpServerUsingRouteClass({ assert }: Context) {
    Route.patch('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'patch' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterADeleteRouteInTheHttpServerUsingRouteClass({ assert }: Context) {
    Route.delete('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'delete' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToDeleteAOptionsRouteInTheHttpServerUsingRouteClass({ assert }: Context) {
    Route.options('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'options' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAAnyRouteInTheHttpServerUsingRouteClass({ assert }: Context) {
    Route.any('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'head' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'post' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'patch' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'put' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'delete' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'options' })).json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAControllerClassInTheHttpServerUsingRouteClass({ assert }: Context) {
    Route.controller(new HelloController()).get('/test', 'index')
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAControllerClassAsStringInTheRouterToUseInRoutes({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.controller('HelloController').get('/test', 'index')
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
  }

  @Test()
  public async shouldThrowAnErrorWhenTheControllerDependencyDoesNotExist({ assert }: Context) {
    assert.throws(() => Route.controller('NotFoundController').get('/test', 'index'))
  }

  @Test()
  public async shouldThrowAnErrorWhenTheControllerMethodDoesNotExist({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    assert.throws(() => Route.controller('HelloController').get('/test', 'not-found'), UndefinedMethodException)
  }

  @Test()
  public async shouldBeAbleToRegisterControllersDependencyMethodsAsStringInRoutes({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.get('/test', 'HelloController.index')
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
  }

  @Test()
  public async shouldThrowAnErrorWhenTheControllerMethodStringDoesNotExist({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    assert.throws(() => Route.get('/test', 'HelloController.not-found'), UndefinedMethodException)
  }

  @Test()
  public async shouldBeAbleToRegisterAMiddlewareClosureInRouteUsingRouteClass({ assert }: Context) {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).middleware(ctx => {
      ctx.data.handled = true
    })

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptMiddlewareClosureInRouteUsingRouteClass({ assert }: Context) {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).interceptor(ctx => {
      ctx.body.intercepted = true

      return ctx.body
    })

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true,
    })
  }

  @Test()
  public async shouldBeAbleToRegisterATerminateMiddlewareClosureInRouteUsingRouteClass({ assert }: Context) {
    let terminated = false

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world' })
    }).terminator(() => {
      terminated = true
    })

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
    assert.isTrue(terminated)
  }

  @Test()
  public async shouldBeAbleToRegisterAMiddlewareClassInRouteUsingRouter({ assert }: Context) {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).middleware(new Middleware())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptMiddlewareClassInRouteUsingRouter({ assert }: Context) {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).interceptor(new Interceptor())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true,
    })
  }

  @Test()
  public async shouldBeAbleToRegisterATerminateMiddlewareClassInRouteUsingRouter({ assert }: Context) {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world' })
    }).terminator(new Terminator())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
  }

  @Test()
  public async shouldBeAbleToRegisterAMiddlewareDependencyInRouteUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Middlewares/Middleware', Middleware)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).middleware('Middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptMiddlewareDependencyInRouteUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Interceptors/Interceptor', Interceptor)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).interceptor('Interceptor')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true,
    })
  }

  @Test()
  public async shouldBeAbleToRegisterATerminateMiddlewareDependencyInRouteUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Terminators/Terminator', Terminator)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world' })
    }).terminator('Terminator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
  }

  @Test()
  public async shouldBeAbleToRegisterANamedMiddlewareDependencyInRouteUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Middlewares/Names/middleware', Middleware)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).middleware('middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterANamedInterceptMiddlewareDependencyInRouteUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Interceptors/Names/interceptor', Interceptor)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).interceptor('interceptor')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true,
    })
  }

  @Test()
  public async shouldBeAbleToRegisterANamedTerminateMiddlewareDependencyInRouteUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Terminators/Names/terminator', Terminator)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world' })
    }).terminator('terminator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
  }

  @Test()
  public async shouldThrowAnExceptionWhenTryingToRegisterAMiddlewareThatDoesNotExist({ assert }: Context) {
    assert.throws(() => Route.get('test', () => {}).middleware('not-found'))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTryingToRegisterAnInterceptMiddlewareThatDoesNotExist({ assert }: Context) {
    assert.throws(() => Route.get('test', () => {}).interceptor('not-found'))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTryingToRegisterATerminatorMiddlewareThatDoesNotExist({ assert }: Context) {
    assert.throws(() => Route.get('test', () => {}).terminator('not-found'))
  }

  @Test()
  public async shouldBeAbleToSetVanillaFastifyOptionsInRoute({ assert }: Context) {
    let errorHappened = false
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.get('test', 'HelloController.vanillaError').vanillaOptions({
      onError: async () => {
        errorHappened = true
      },
    })

    Route.register()
    await Server.request({ path: '/test', method: 'get' })

    assert.isTrue(errorHappened)
  }
}
