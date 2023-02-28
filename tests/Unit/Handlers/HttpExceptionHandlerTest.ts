/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fake } from 'sinon'
import { test } from '@japa/runner'
import { Exception } from '@athenna/common'
import { Log, LoggerProvider } from '@athenna/logger'
import { HttpKernel, HttpServerProvider, Server } from '#src'

test.group('HttpExceptionHandlerTest', group => {
  group.each.setup(async () => {
    ioc.reconstruct()

    await Config.loadAll(Path.stubs('config'))
    new HttpServerProvider().register()
    new LoggerProvider().register()
  })

  group.each.teardown(async () => {
    Log.restoreAllMethods()
  })

  test('should be able to throw customized Athenna exceptions in the default exception handler', async ({ assert }) => {
    const kernel = new HttpKernel()
    await kernel.registerExceptionHandler()
    Server.get({
      url: '/hello',
      handler: () => {
        throw new Exception({ code: 'E_NOT_FOUND', message: 'hey', status: 404 })
      },
    })

    const response = await Server.request().get('hello')

    assert.isDefined(response.json().stack)
    assert.containsSubset(response.json(), {
      statusCode: 404,
      code: 'E_NOT_FOUND',
      name: 'Exception',
      message: 'hey',
    })
  })

  test('should not set the error name, error message and error stack when debug mode is not activated in default exception handler', async ({
    assert,
  }) => {
    Config.set('app.debug', false)
    const kernel = new HttpKernel()
    await kernel.registerExceptionHandler()
    Server.get({
      url: '/hello',
      handler: () => {
        throw new TypeError('hey')
      },
    })

    const response = await Server.request().get('hello')

    assert.isUndefined(response.json().stack)
    assert.containsSubset(response.json(), {
      statusCode: 500,
      code: 'E_INTERNAL_SERVER',
      name: 'InternalServerException',
      message: 'An internal server exception has occurred.',
    })
  })

  test('should ignore the exception from being logged when the code is set inside ignoreCodes', async ({ assert }) => {
    const logErrorFake = fake()
    const kernel = new HttpKernel()
    await kernel.registerExceptionHandler('#tests/Stubs/handlers/Handler')
    Log.fakeMethod('channelOrVanilla', logErrorFake)

    Server.get({
      url: '/hello',
      handler: () => {
        throw new Exception({ code: 'E_IGNORE_THIS' })
      },
    })

    await Server.request().get('hello')

    assert.isFalse(logErrorFake.called)
  })

  test('should ignore the exception from being logged when the status is set inside ignoreStatuses', async ({
    assert,
  }) => {
    const logErrorFake = fake()
    const kernel = new HttpKernel()
    await kernel.registerExceptionHandler('#tests/Stubs/handlers/Handler')
    Log.fakeMethod('channelOrVanilla', logErrorFake)

    Server.get({
      url: '/hello',
      handler: () => {
        throw new Exception({ status: 248 })
      },
    })

    await Server.request().get('hello')

    assert.isFalse(logErrorFake.called)
  })
})
