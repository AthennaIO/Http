/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Config, Exception, Folder, Path } from '@secjs/utils'
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

    response.status(200).send(body)
  }

  group.each.setup(async () => {
    await new Folder(Path.stubs('app')).copy(Path.app())
    await new Folder(Path.stubs('config')).copy(Path.config())

    await new Config().safeLoad(Path.config('http.js'))
    await new Config().safeLoad(Path.config('logging.js'))

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

    await kernel.registerCors()
    await kernel.registerRateLimit()
    await kernel.registerMiddlewares()
    await kernel.registerErrorHandler()
    await kernel.registerLogMiddleware()
    await kernel.registerRequestIdMiddleware()

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
})
