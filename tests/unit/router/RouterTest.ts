/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { View, ViewProvider } from '@athenna/view'
import { MyValidator } from '#tests/fixtures/validators/MyValidator'
import { MyMiddleware } from '#tests/fixtures/middlewares/MyMiddleware'
import { MyTerminator } from '#tests/fixtures/middlewares/MyTerminator'
import { MyInterceptor } from '#tests/fixtures/middlewares/MyInterceptor'
import { Test, AfterEach, BeforeEach, type Context } from '@athenna/test'
import { HelloController } from '#tests/fixtures/controllers/HelloController'
import { Route, Server, HttpRouteProvider, HttpServerProvider } from '#src'
import { UndefinedMethodException } from '#src/exceptions/UndefinedMethodException'

export default class RouterTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    new ViewProvider().register()
    new HttpServerProvider().register()
    new HttpRouteProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    View.removeComponent('test')
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
      interceptors: []
    })
    assert.deepEqual(route.fastify, { schema: {}, config: {} })
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
  public async shouldBeAbleToRegisterARouteThatWillAutomaticallyRenderAView({ assert }: Context) {
    View.createComponent('test', '<h1>{{ name }}</h1>')
    Route.view('/test', 'test', { name: 'lenon' })
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).body, '<h1>lenon</h1>')
  }

  @Test()
  public async shouldBeAbleToRegisterARouteThatWillAutomaticallyRedirectToOtherRoute({ assert }: Context) {
    Route.get('/redirected-test/:id', ({ request, response }) => {
      return response.status(200).send({ id: request.param('id'), name: request.query('name') })
    })
    Route.redirect('/test/:id', '/redirected-test/:id')
    Route.register()

    const redirectRes = await Server.request({ path: '/test/1', method: 'get', query: { name: 'lenon' } })

    /**
     * Light my request does not have follow redirects feature,
     * so we have to implement it here. But there is a feature
     * request for it:
     *
     * https://github.com/fastify/light-my-request/issues/209
     */
    const location = redirectRes.headers.location as string
    const response = await Server.request({
      path: location.replace(':id', '1'),
      method: 'get',
      query: { name: 'lenon' }
    })

    assert.deepEqual(response.json(), {
      id: '1',
      name: 'lenon'
    })
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
      ctx.response.body.intercepted = true

      return ctx.response.body
    })

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true
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
      hello: 'world'
    })
    assert.isTrue(terminated)
  }

  @Test()
  public async shouldBeAbleToRegisterAValidatorClassInRouteUsingRouter({ assert }: Context) {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).validator(new MyValidator())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAMiddlewareClassInRouteUsingRouter({ assert }: Context) {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).middleware(new MyMiddleware())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptMiddlewareClassInRouteUsingRouter({ assert }: Context) {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).interceptor(new MyInterceptor())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true
    })
  }

  @Test()
  public async shouldBeAbleToRegisterATerminateMiddlewareClassInRouteUsingRouter({ assert }: Context) {
    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world' })
    }).terminator(new MyTerminator())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world'
    })
  }

  @Test()
  public async shouldBeAbleToRegisterAValidatorDependencyInRouteUsingRouter({ assert }: Context) {
    ioc.bind('App/Validators/Validator', MyValidator)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).validator('Validator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAMiddlewareDependencyInRouteUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Middlewares/Middleware', MyMiddleware)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).middleware('Middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptMiddlewareDependencyInRouteUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Interceptors/Interceptor', MyInterceptor)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).interceptor('Interceptor')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true
    })
  }

  @Test()
  public async shouldBeAbleToRegisterATerminateMiddlewareDependencyInRouteUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Terminators/Terminator', MyTerminator)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world' })
    }).terminator('Terminator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world'
    })
  }

  @Test()
  public async shouldBeAbleToRegisterANamedValidatorDependencyInRouteUsingRouter({ assert }: Context) {
    ioc.bind('App/Validators/Names/validator', MyValidator)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).validator('validator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterANamedMiddlewareDependencyInRouteUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Middlewares/Names/middleware', MyMiddleware)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).middleware('middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterANamedInterceptMiddlewareDependencyInRouteUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Interceptors/Names/interceptor', MyInterceptor)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world', handled: ctx.data.handled })
    }).interceptor('interceptor')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true
    })
  }

  @Test()
  public async shouldBeAbleToRegisterANamedTerminateMiddlewareDependencyInRouteUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Terminators/Names/terminator', MyTerminator)

    Route.get('test', ctx => {
      ctx.response.send({ hello: 'world' })
    }).terminator('terminator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world'
    })
  }

  @Test()
  public async shouldThrowAnExceptionWhenTryingToRegisterAValidatorThatDoesNotExist({ assert }: Context) {
    assert.throws(() => Route.get('test', () => {}).validator('not-found'))
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
      }
    })

    Route.register()
    await Server.request({ path: '/test', method: 'get' })

    assert.isTrue(errorHappened)
  }
}
