/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { MyValidator } from '#tests/fixtures/validators/MyValidator'
import { MyMiddleware } from '#tests/fixtures/middlewares/MyMiddleware'
import { MyTerminator } from '#tests/fixtures/middlewares/MyTerminator'
import { MyInterceptor } from '#tests/fixtures/middlewares/MyInterceptor'
import { Test, AfterEach, BeforeEach, type Context } from '@athenna/test'
import { Route, Server, HttpRouteProvider, HttpServerProvider } from '#src'

export default class RouteGroupTest {
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
  public async shouldBeAbleToCreateARouteGroupUsingRouteClass({ assert }: Context) {
    Route.group(() => {
      Route.get('/test', ctx => ctx.response.send({ hello: 'world' }))
    }).prefix('/v1')

    Route.register()

    const response = await Server.request({ path: '/v1/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToCreateARouteGroupInsideOtherRouteGroupUsingRouteClass({ assert }: Context) {
    Route.group(() => {
      Route.group(() => {
        Route.get('/test', ctx => ctx.response.send({ hello: 'world' }))
      }).prefix('/v1')
    }).prefix('/api')

    Route.register()

    const response = await Server.request({ path: '/api/v1/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleTocreateARouteGroupThatAddsHelmetOptionsUsingRouteClass({ assert }: Context) {
    await Server.plugin(import('@fastify/helmet'), { global: false })

    Route.group(() => {
      Route.get('/test', ctx => ctx.response.send({ hello: 'world' }))
    })
      .prefix('/v1')
      .helmet({
        dnsPrefetchControl: { allow: true }
      })

    Route.register()

    const response = await Server.request({ path: '/v1/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
    assert.deepEqual(
      response.headers['content-security-policy'],
      "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests"
    )
  }

  @Test()
  public async shouldBeAbleToDefineRouteNameForEachRouteInTheGroup({ assert }: Context) {
    Route.group(() => {
      Route.get('/test', ctx => ctx.response.send({ name: ctx.request.routeName }))
    }).name('test')

    Route.register()

    const response = await Server.request({ path: '/test', method: 'get' })

    assert.deepEqual(response.json(), { name: 'test' })
  }

  @Test()
  public async shouldBeAbleToCreateARouteGroupThatAddsRateLimitOptionsUsingRouteClass({ assert }: Context) {
    await Server.plugin(import('@fastify/rate-limit'))

    Route.group(() => {
      Route.get('/test', ctx => ctx.response.send({ hello: 'world' }))
    })
      .prefix('/v1')
      .rateLimit({
        max: 100,
        timeWindow: '1 minute'
      })

    Route.register()

    const response = await Server.request({ path: '/v1/test', method: 'get' })

    assert.deepEqual(response.json(), { hello: 'world' })
    assert.equal(response.headers['x-ratelimit-limit'], '100')
    assert.equal(response.headers['x-ratelimit-remaining'], '99')
    assert.equal(response.headers['x-ratelimit-reset'], '60')
  }

  @Test()
  public async shouldBeAbleToRegisterAMiddlewareClosureInRouteGroupUsingRouteClass({ assert }: Context) {
    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).middleware(ctx => (ctx.data.handled = true))

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptMiddlewareClosureInRouteGroupUsingRouter({ assert }: Context) {
    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
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
  public async shouldBeAbleToRegisterATerminateMiddlewareClosureInRouteGroupUsingRouter({ assert }: Context) {
    let terminated = false

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
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
  public async shouldBeAbleToRegisterAValidatorClassInRouteGroupUsingRouter({ assert }: Context) {
    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).validator(new MyValidator())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAMiddlewareClassInRouteGroupUsingRouter({ assert }: Context) {
    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).middleware(new MyMiddleware())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptMiddlewareClassInRouteGroupUsingRouter({ assert }: Context) {
    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).interceptor(new MyInterceptor())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true
    })
  }

  @Test()
  public async shouldBeAbleToRegisterATerminateMiddlewareClassInRouteGroupUsingRouter({ assert }: Context) {
    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).terminator(new MyTerminator())

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world'
    })
  }

  @Test()
  public async shouldBeAbleToRegisterAValidatorDependencyInRouteGroupUsingRouter({ assert }: Context) {
    ioc.bind('App/Validators/Validator', MyValidator)

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).validator('Validator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAMiddlewareDependencyInRouteGroupUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Middlewares/Middleware', MyMiddleware)

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).middleware('Middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptMiddlewareDependencyInRouteGroupUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Interceptors/Interceptor', MyInterceptor)

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).interceptor('Interceptor')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true
    })
  }

  @Test()
  public async shouldBeAbleToRegisterATerminateMiddlewareDependencyInRouteGroupUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Terminators/Terminator', MyTerminator)

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).terminator('Terminator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world'
    })
  }

  @Test()
  public async shouldBeAbleToRegisterANamedValidatorInRouteGroupUsingRouter({ assert }: Context) {
    ioc.bind('App/Validators/Names/validator', MyValidator)

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).validator('validator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterANamedMiddlewareInRouteGroupUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Middlewares/Names/middleware', MyMiddleware)

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).middleware('middleware')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), { hello: 'world', handled: true })
  }

  @Test()
  public async shouldBeAbleToRegisterAnInterceptNamedMiddlewareInRouteGroupUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Interceptors/Names/interceptor', MyInterceptor)

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).interceptor('interceptor')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world',
      intercepted: true
    })
  }

  @Test()
  public async shouldBeAbleToRegisterATerminateNamedMiddlewareInRouteGroupUsingRouter({ assert }: Context) {
    ioc.bind('App/Http/Terminators/Names/terminator', MyTerminator)

    Route.group(() => {
      Route.get('test', ctx => {
        ctx.response.send({ hello: 'world', handled: ctx.data.handled })
      })
    }).terminator('terminator')

    Route.register()

    assert.deepEqual((await Server.request({ path: '/test', method: 'get' })).json(), {
      hello: 'world'
    })
  }

  @Test()
  public async shouldThrowAnExceptionWhenValidatorNameAndDependencyDoesNotExists({ assert }: Context) {
    assert.throws(() => Route.group(() => Route.get('test', () => {})).validator('not-found'))
  }

  @Test()
  public async shouldThrowAnExceptionWhenMiddlewareNameAndDependencyDoesNotExists({ assert }: Context) {
    assert.throws(() => Route.group(() => Route.get('test', () => {})).middleware('not-found'))
  }

  @Test()
  public async shouldThrowAnExceptionWhenInterceptorMiddlewareNameAndDependencyDoesNotExists({ assert }: Context) {
    assert.throws(() => Route.group(() => Route.get('test', () => {})).interceptor('not-found'))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTerminatorMiddlewareNameAndDependencyDoesNotExists({ assert }: Context) {
    assert.throws(() => Route.group(() => Route.get('test', () => {})).terminator('not-found'))
  }
}
