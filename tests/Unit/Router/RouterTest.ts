/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Middleware } from '#tests/Stubs/middlewares/Middleware'
import { Terminator } from '#tests/Stubs/middlewares/Terminator'
import { Interceptor } from '#tests/Stubs/middlewares/Interceptor'
import { Test, AfterEach, BeforeEach, TestContext } from '@athenna/test'
import { HelloController } from '#tests/Stubs/controllers/HelloController'
import { Route, Server, HttpRouteProvider, HttpServerProvider } from '#src'
import { UndefinedMethodException } from '#src/Exceptions/UndefinedMethodException'

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
  public async shouldBeAbleToListTheRouteRegisteredInTheRouteClass({ assert }: TestContext) {
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
  public async shouldBeAbleToRegisterVanillaFastifyRoutesUsingRouteClass({ assert }: TestContext) {
    Route.vanillaRoute({ url: '/test', handler: (_, res) => res.send({ hello: 'world' }), method: ['GET'] })

    const response = await Server.request({ path: '/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAGetRouteInTheHttpServerUsingRouteClass({ assert }: TestContext) {
    Route.get('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAHeadRouteInTheHttpServerUsingRouteClass({ assert }: TestContext) {
    Route.head('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'head' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAPostRouteInTheHttpServerUsingRouteClass({ assert }: TestContext) {
    Route.post('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'post' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAPutRouteInTheHttpServerUsingRouteClass({ assert }: TestContext) {
    Route.put('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'put' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAPatchRouteInTheHttpServerUsingRouteClass({ assert }: TestContext) {
    Route.patch('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'patch' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterADeleteRouteInTheHttpServerUsingRouteClass({ assert }: TestContext) {
    Route.delete('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'delete' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToDeleteAOptionsRouteInTheHttpServerUsingRouteClass({ assert }: TestContext) {
    Route.options('/test', ctx => ctx.response.send({ hello: 'world' }))
    Route.register()

    const response = await Server.request({ path: '/test', method: 'options' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAAnyRouteInTheHttpServerUsingRouteClass({ assert }: TestContext) {
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
  public async shouldBeAbleToRegisterAControllerClassInTheHttpServerUsingRouteClass({ assert }: TestContext) {
    Route.controller(new HelloController()).get('/test', 'index')
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAControllerClassAsStringInTheRouterToUseInRoutes({ assert }: TestContext) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.controller('HelloController').get('/test', 'index')
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
  }

  @Test()
  public async shouldThrowAnErrorWhenTheControllerDependencyDoesNotExist({ assert }: TestContext) {
    assert.throws(() => Route.controller('NotFoundController').get('/test', 'index'))
  }

  @Test()
  public async shouldThrowAnErrorWhenTheControllerMethodDoesNotExist({ assert }: TestContext) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    assert.throws(() => Route.controller('HelloController').get('/test', 'not-found'), UndefinedMethodException)
  }

  @Test()
  public async shouldBeAbleToRegisterControllersDependencyMethodsAsStringInRoutes({ assert }: TestContext) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.get('/test', 'HelloController.index')
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
  }

  @Test()
  public async shouldThrowAnErrorWhenTheControllerMethodStringDoesNotExist({ assert }: TestContext) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    assert.throws(() => Route.get('/test', 'HelloController.not-found'), UndefinedMethodException)
  }

  @Test()
  public async shouldBeAbleToRegisterAMiddlewareClosureInRouteUsingRouteClass({ assert }: TestContext) {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).middleware(ctx => {
      ctx.data.handled = true
    })

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptMiddlewareClosureInRouteUsingRouteClass({ assert }: TestContext) {
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
  public async shouldBeAbleToRegisterATerminateMiddlewareClosureInRouteUsingRouteClass({ assert }: TestContext) {
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
  public async shouldBeAbleToRegisterAMiddlewareClassInRouteUsingRouter({ assert }: TestContext) {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).middleware(new Middleware())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptMiddlewareClassInRouteUsingRouter({ assert }: TestContext) {
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
  public async shouldBeAbleToRegisterATerminateMiddlewareClassInRouteUsingRouter({ assert }: TestContext) {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world' })
    }).terminator(new Terminator())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
    })
  }

  @Test()
  public async shouldBeAbleToRegisterAMiddlewareDependencyInRouteUsingRouter({ assert }: TestContext) {
    ioc.bind('App/Http/Middlewares/Middleware', Middleware)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).middleware('Middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptMiddlewareDependencyInRouteUsingRouter({ assert }: TestContext) {
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
  public async shouldBeAbleToRegisterATerminateMiddlewareDependencyInRouteUsingRouter({ assert }: TestContext) {
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
  public async shouldBeAbleToRegisterANamedMiddlewareDependencyInRouteUsingRouter({ assert }: TestContext) {
    ioc.bind('App/Http/Middlewares/Names/middleware', Middleware)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).middleware('middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterANamedInterceptMiddlewareDependencyInRouteUsingRouter({ assert }: TestContext) {
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
  public async shouldBeAbleToRegisterANamedTerminateMiddlewareDependencyInRouteUsingRouter({ assert }: TestContext) {
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
  public async shouldThrowAnExceptionWhenTryingToRegisterAMiddlewareThatDoesNotExist({ assert }: TestContext) {
    assert.throws(() => Route.get('test', () => {}).middleware('not-found'))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTryingToRegisterAnInterceptMiddlewareThatDoesNotExist({
    assert,
  }: TestContext) {
    assert.throws(() => Route.get('test', () => {}).interceptor('not-found'))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTryingToRegisterATerminatorMiddlewareThatDoesNotExist({
    assert,
  }: TestContext) {
    assert.throws(() => Route.get('test', () => {}).terminator('not-found'))
  }

  @Test()
  public async shouldBeAbleToSetVanillaFastifyOptionsInRoute({ assert }: TestContext) {
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
