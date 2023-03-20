/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { TestRequest } from './Request/TestRequest.js'

declare module '@japa/runner' {
  interface TestContext {
    request: TestRequest
  }
}

export * from './Request/TestRequest.js'
export * from './Request/TestResponse.js'

/**
 * Request plugin register the request macro to the test context.
 */
export function request() {
  return async function (_config, _runner, classes) {
    classes.TestContext.macro('request', new TestRequest())
  }
}
