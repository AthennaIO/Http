/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Server } from '#src'
import { Assert } from '@japa/assert'
import type { InjectOptions } from '#src/types'
import { TestResponse } from '#src/testing/plugins/request/TestResponse'

export class TestRequest {
  /**
   * Japa assert class instance.
   */
  public assert = new Assert()

  /**
   * Instantiate TestResponse class from API response.
   */
  public createResponse(response: any): TestResponse {
    return new TestResponse(this.assert, response)
  }

  /**
   * Make a GET request to the given URL and options.
   *
   * @example
   * ```js
   * const response = await request.get('/users')
   *
   * response.assertStatusCode(200)
   * ```
   */
  public async get(
    url: string,
    options: InjectOptions = {}
  ): Promise<TestResponse> {
    return Server.request({ url, method: 'GET', ...options }).then(res =>
      this.createResponse(res)
    )
  }

  /**
   * Make a HEAD request to the given URL and options.
   *
   * @example
   * ```js
   * const response = await request.head('/users')
   *
   * response.assertStatusCode(200)
   * ```
   */
  public async head(
    url: string,
    options: InjectOptions = {}
  ): Promise<TestResponse> {
    return Server.request({ url, method: 'HEAD', ...options }).then(res =>
      this.createResponse(res)
    )
  }

  /**
   * Make a OPTIONS request to the given URL and options.
   *
   * @example
   * ```js
   * const response = await request.options('/users')
   *
   * response.assertStatusCode(200)
   * ```
   */
  public async options(
    url: string,
    options: InjectOptions = {}
  ): Promise<TestResponse> {
    return Server.request({ url, method: 'OPTIONS', ...options }).then(res =>
      this.createResponse(res)
    )
  }

  /**
   * Make a POST request to the given URL and options.
   *
   * @example
   * ```js
   * const response = await request.post('/users')
   *
   * response.assertStatusCode(200)
   * ```
   */
  public async post(
    url: string,
    options: InjectOptions = {}
  ): Promise<TestResponse> {
    return Server.request({ url, method: 'POST', ...options }).then(res =>
      this.createResponse(res)
    )
  }

  /**
   * Make a PUT request to the given URL and options.
   *
   * @example
   * ```js
   * const response = await request.put('/users')
   *
   * response.assertStatusCode(200)
   * ```
   */
  public async put(
    url: string,
    options: InjectOptions = {}
  ): Promise<TestResponse> {
    return Server.request({ url, method: 'PUT', ...options }).then(res =>
      this.createResponse(res)
    )
  }

  /**
   * Make a PATCH request to the given URL and options.
   *
   * @example
   * ```js
   * const response = await request.patch('/users')
   *
   * response.assertStatusCode(200)
   * ```
   */
  public async patch(
    url: string,
    options: InjectOptions = {}
  ): Promise<TestResponse> {
    return Server.request({ url, method: 'PATCH', ...options }).then(res =>
      this.createResponse(res)
    )
  }

  /**
   * Make a DELETE request to the given URL and options.
   *
   * @example
   * ```js
   * const response = await request.delete('/users')
   *
   * response.assertStatusCode(200)
   * ```
   */
  public async delete(
    url: string,
    options: InjectOptions = {}
  ): Promise<TestResponse> {
    return Server.request({ url, method: 'DELETE', ...options }).then(res =>
      this.createResponse(res)
    )
  }
}
