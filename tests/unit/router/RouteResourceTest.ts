/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { MyMiddleware } from '#tests/fixtures/middlewares/MyMiddleware'
import { MyTerminator } from '#tests/fixtures/middlewares/MyTerminator'
import { MyInterceptor } from '#tests/fixtures/middlewares/MyInterceptor'
import { Test, AfterEach, BeforeEach, type Context } from '@athenna/test'
import { HelloController } from '#tests/fixtures/controllers/HelloController'
import { Route, Server, HttpRouteProvider, HttpServerProvider } from '#src'

export default class RouteResourceTest {
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
  public async shouldBeAbleToRegisterARouteResourceUsingRouteClass({ assert }: Context) {
    Route.resource('test', new HelloController())
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'post' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'get' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'put' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'delete' })).json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterARouteResourceOnlySomeRoutesUsingRouteClass({ assert }: Context) {
    Route.resource('test', new HelloController()).only(['index'])
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'post' })).json(), {
      error: 'Not Found',
      message: 'Route POST:/test not found',
      statusCode: 404
    })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'get' })).json(), {
      error: 'Not Found',
      message: 'Route GET:/test/:id not found',
      statusCode: 404
    })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'put' })).json(), {
      error: 'Not Found',
      message: 'Route PUT:/test/:id not found',
      statusCode: 404
    })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'patch' })).json(), {
      error: 'Not Found',
      message: 'Route PATCH:/test/:id not found',
      statusCode: 404
    })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'delete' })).json(), {
      error: 'Not Found',
      message: 'Route DELETE:/test/:id not found',
      statusCode: 404
    })
  }

  @Test()
  public async shouldBeAbleToRegisterARouteResourceExceptSomeRoutesUsingRouteClass({ assert }: Context) {
    Route.controller(new HelloController()).resource('test').except(['index'])
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'post' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'get' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'put' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test/:id', method: 'delete' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      error: 'Not Found',
      message: 'Route GET:/test not found',
      statusCode: 404
    })
  }

  @Test()
  public async shouldBeAbleToRegisterAResourceInsideTheGroupUsingRouteClass({ assert }: Context) {
    Route.group(() => {
      Route.resource('test', new HelloController())
    }).prefix('/v1')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/v1/test', method: 'get' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/v1/test', method: 'post' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/v1/test/:id', method: 'get' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/v1/test/:id', method: 'put' })).json(), { hello: 'world' })
    assert.deepEqual((await Server.request({ path: '/v1/test/:id', method: 'delete' })).json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToRegisterAControllerClassAsStringInTheResourcesOfRoute({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.resource('test', 'HelloController').only(['index'])
    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world' })
  }

  @Test()
  public async shouldThrowAnExceptionWhenControllerClassDependencyDoesNotExist({ assert }: Context) {
    assert.throws(() => Route.resource('test', 'NotFoundController'))
  }

  @Test()
  public async shouldBeAbleToRegisterARouteResourceWithHelmetOptions({ assert }: Context) {
    await Server.plugin(import('@fastify/helmet'), { global: false })

    Route.resource('test', new HelloController())
      .only(['index'])
      .helmet({
        dnsPrefetchControl: { allow: true }
      })
    Route.register()

    const response = await Server.request({ path: '/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
    assert.deepEqual(
      response.headers['content-security-policy'],
      "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests"
    )
  }

  @Test()
  public async shouldBeAbleToRegisterARouteResourceWithRateLimitOptions({ assert }: Context) {
    await Server.plugin(import('@fastify/rate-limit'), { global: false })

    Route.resource('test', new HelloController()).only(['index']).rateLimit({
      max: 100,
      timeWindow: '1 minute'
    })
    Route.register()

    const response = await Server.request({ path: '/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
    assert.equal(response.headers['x-ratelimit-limit'], '100')
    assert.equal(response.headers['x-ratelimit-remaining'], '99')
    assert.equal(response.headers['x-ratelimit-reset'], '60')
  }

  @Test()
  public async shouldBeAbleToRegisterAMiddlewareClosureInRouteResourceUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.controller('HelloController')
      .resource('test')
      .only(['index'])
      .middleware(ctx => (ctx.data.handled = true))

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptMiddlewareClosureInRouteResourceUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.controller('HelloController')
      .resource('test')
      .only(['index'])
      .interceptor(ctx => {
        ctx.body.intercepted = true

        return ctx.body
      })

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true
    })
  }

  @Test()
  public async shouldBeAbleToRegisterATerminateMiddlewareClosureInRouteResourceUsingRouter({ assert }: Context) {
    let terminated = false
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.controller('HelloController')
      .resource('test')
      .only(['index'])
      .terminator(() => {
        terminated = true
      })

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world'
    })
    assert.isTrue(terminated)
  }

  @Test()
  public async shouldBeAbleToRegisterAMiddlewareClassInRouteResourceUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.controller('HelloController').resource('test').only(['index']).middleware(new MyMiddleware())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptMiddlewareClassInRouteResourceUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.controller('HelloController').resource('test').only(['index']).interceptor(new MyInterceptor())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true
    })
  }

  @Test()
  public async shouldBeAbleToRegisterATerminateMiddlewareClassInRouteResourceUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.controller('HelloController').resource('test').only(['index']).terminator(new MyTerminator())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world'
    })
  }

  @Test()
  public async shouldBeAbleToRegisterAMiddlewareDependencyInRouteResourceUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)
    ioc.bind('App/Http/Middlewares/Middleware', MyMiddleware)

    Route.controller('HelloController').resource('test').only(['index']).middleware('Middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptMiddlewareDependencyInRouteResourceUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)
    ioc.bind('App/Http/Interceptors/Interceptor', MyInterceptor)

    Route.controller('HelloController').resource('test').only(['index']).interceptor('Interceptor')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true
    })
  }

  @Test()
  public async shouldBeAbleToRegisterATerminateMiddlewareDependencyInRouteResourceUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)
    ioc.bind('App/Http/Terminators/Terminator', MyTerminator)

    Route.controller('HelloController').resource('test').only(['index']).terminator('Terminator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world'
    })
  }

  @Test()
  public async shouldBeAbleToRegisterANamedMiddlewareDependencyInRouteResourceUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)
    ioc.bind('App/Http/Middlewares/Names/my-middleware', MyMiddleware)

    Route.controller('HelloController').resource('test').only(['index']).middleware('my-middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptNamedMiddlewareDependencyInRouteResourceUsingRouter({
    assert
  }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)
    ioc.bind('App/Http/Interceptors/Names/my-interceptor', MyInterceptor)

    Route.controller('HelloController').resource('test').only(['index']).interceptor('my-interceptor')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true
    })
  }

  @Test()
  public async shouldBeAbleToRegisterATerminateNamedMiddlewareDependencyInRouteResourceUsingRouter({
    assert
  }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)
    ioc.bind('App/Http/Terminators/Names/my-terminator', MyTerminator)

    Route.controller('HelloController').resource('test').only(['index']).terminator('my-terminator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world'
    })
  }

  @Test()
  public async shouldThrowAnExceptionWhenMiddlewareNameAndDependencyDoesNotExists({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    assert.throws(() => Route.resource('test', 'HelloController').middleware('not-found'))
  }

  @Test()
  public async shouldThrowAnExceptionWhenInterceptorMiddlewareNameAndDependencyDoesNotExists({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    assert.throws(() => Route.resource('test', 'HelloController').interceptor('not-found'))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTerminatorMiddlewareNameAndDependencyDoesNotExists({ assert }: Context) {
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    assert.throws(() => Route.resource('test', 'HelloController').terminator('not-found'))
  }
}
