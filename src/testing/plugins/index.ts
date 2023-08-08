/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { TestRequest } from '#src/testing/plugins/request/TestRequest'

declare module '@japa/runner' {
  interface TestContext {
    request: TestRequest
  }
}

export * from '#src/testing/plugins/request/TestRequest'
export * from '#src/testing/plugins/request/TestResponse'

/**
 * Request plugin registers the request macro to the test context.
 */
export function request() {
  return function (_config, _runner, classes) {
    classes.TestContext.macro('request', new TestRequest())
  }
}
