/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Config } from '@athenna/config'
import { Exception, Folder, Is, Path } from '@athenna/common'
import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'

import { Route, Server } from '#src/index'
import { Kernel } from '#tests/Stubs/app/Http/Kernel'
import { HttpRouteProvider } from '#src/Providers/HttpRouteProvider'
import { HttpServerProvider } from '#src/Providers/HttpServerProvider'

test.group('KernelTest', group => {
  const handler = async ({ data, request, response }) => {
    const body = { hello: 'world' }

    if (data.param) body.param = data.param
    if (data.requestId) body.requestId = data.requestId
    if (data.midHandler) body.midHandler = data.midHandler
    if (request.queries.test) body.test = request.query('test')
    if (request.queries.throwError) throw new Exception('Testing', 400, 'EXCEPTION', 'Restart computer.')
    if (request.queries.throwTypeError) throw new TypeError('Type error happens')

    response.header('x-request-id', data.traceId).status(200).send(body)
  }

  group.each.setup(async () => {
    await new Folder(Path.stubs('app')).copy(Path.app())
    await new Folder(Path.stubs('config')).copy(Path.config())

    await Config.safeLoad(Path.config('http.js'))
    await Config.safeLoad(Path.config('logging.js'))

    new HttpServerProvider().register()
    new HttpRouteProvider().boot()
    new LoggerProvider().register()
  })

  group.each.teardown(async () => {
    await Server.close()

    await Folder.safeRemove(Path.app())
    await Folder.safeRemove(Path.config())
  })

  test('should be able to instantiate a new http kernel and register middlewares', async ({ assert }) => {
    const kernel = new Kernel()

    await kernel.registerTracer()
    await kernel.registerMiddlewares()
    await kernel.registerErrorHandler()
    await kernel.registerLogMiddleware()

    Route.get('test', handler).middleware('intercept')
    Route.register()

    await Server.listen(3040)

    const normalError = await Server.request().get('/test').query({ throwError: 'true' })

    assert.equal(normalError.statusCode, 400)
    assert.equal(normalError.json().message, 'Testing')

    const typeError = await Server.request().get('/test').query({ throwTypeError: 'true' })

    assert.equal(typeError.statusCode, 500)
    assert.equal(typeError.json().message, 'An internal server exception has occurred.')
  })

  test('should be able to instantiate a new http kernel and register plugins', async ({ assert }) => {
    const kernel = new Kernel()

    await kernel.registerCors()
    await kernel.registerTracer()
    await kernel.registerHelmet()
    await kernel.registerSwagger()
    await kernel.registerRateLimit()
    await kernel.registerMiddlewares()
    await kernel.registerErrorHandler()
    await kernel.registerLogMiddleware()

    Route.get('test', handler)
    Route.register()

    await Server.listen(3040)

    const response = await Server.request().get('/test')

    assert.isDefined(response.headers['content-security-policy'])
    assert.isDefined(response.headers['cross-origin-opener-policy'])
    assert.isDefined(response.headers['access-control-allow-origin'])
    assert.isDefined(response.headers['x-ratelimit-limit'])
    assert.isTrue(Is.Uuid(response.headers['x-request-id']))

    const { statusCode } = await Server.request().get('/documentation')

    assert.equal(statusCode, 302)
  })
})
