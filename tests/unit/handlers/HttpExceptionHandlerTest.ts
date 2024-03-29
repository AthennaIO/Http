/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, Exception } from '@athenna/common'
import { Log, LoggerProvider } from '@athenna/logger'
import { HttpKernel, HttpServerProvider, Server } from '#src'
import { Test, AfterEach, BeforeEach, type Context, Mock } from '@athenna/test'

export default class HttpExceptionHandlerTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    await Config.loadAll(Path.fixtures('config'))
    new HttpServerProvider().register()
    new LoggerProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()
  }

  @Test()
  public async shouldBeAbleToThrowCustomizedAthennaExceptionsInTheDefaultExceptionHandler({ assert }: Context) {
    const kernel = new HttpKernel()
    await kernel.registerExceptionHandler()
    Server.get({
      url: '/hello',
      handler: () => {
        throw new Exception({ code: 'E_NOT_FOUND', message: 'hey', status: 404 })
      }
    })

    const response = await Server.request().get('hello')

    assert.isDefined(response.json().stack)
    assert.containsSubset(response.json(), {
      statusCode: 404,
      code: 'E_NOT_FOUND',
      name: 'Exception',
      message: 'hey'
    })
  }

  @Test()
  public async shouldNotSetTheErrorNameErrorMessageAndErrorStackWhenDebugModeIsNotActivatedInDefaultExceptionHandler({
    assert
  }: Context) {
    Config.set('app.debug', false)
    const kernel = new HttpKernel()
    await kernel.registerExceptionHandler()
    Server.get({
      url: '/hello',
      handler: () => {
        throw new TypeError('hey')
      }
    })

    const response = await Server.request().get('hello')

    assert.isUndefined(response.json().stack)
    assert.containsSubset(response.json(), {
      statusCode: 500,
      code: 'E_INTERNAL_SERVER',
      name: 'InternalServerException',
      message: 'An internal server exception has occurred.'
    })
  }

  @Test()
  public async shouldIgnoreTheExceptionFromBeingLoggedWhenTheCodeIsSetInsideIgnoreCodes({ assert }: Context) {
    const logErrorFake = Mock.fake()
    const kernel = new HttpKernel()
    await kernel.registerExceptionHandler('#tests/fixtures/handlers/Handler')
    Log.when('channelOrVanilla').return(logErrorFake)

    Server.get({
      url: '/hello',
      handler: () => {
        throw new Exception({ code: 'E_IGNORE_THIS' })
      }
    })

    await Server.request().get('hello')

    assert.isFalse(logErrorFake.called)
  }

  @Test()
  public async shouldIgnoreTheExceptionFromBeingLoggedWhenTheStatusIsSetInsideIgnoreStatuses({ assert }: Context) {
    const logErrorFake = Mock.fake()
    const kernel = new HttpKernel()
    await kernel.registerExceptionHandler('#tests/fixtures/handlers/Handler')
    Log.when('channelOrVanilla').return(logErrorFake)

    Server.get({
      url: '/hello',
      handler: () => {
        throw new Exception({ status: 248 })
      }
    })

    await Server.request().get('hello')

    assert.isFalse(logErrorFake.called)
  }
}
