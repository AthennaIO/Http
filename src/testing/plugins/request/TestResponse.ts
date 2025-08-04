/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Assert } from '@japa/assert'
import { Json, Macroable } from '@athenna/common'
import type { Response } from 'light-my-request'

export class TestResponse extends Macroable {
  /**
   * Japa assert class instance.
   */
  public assert: Assert

  /**
   * Light my request response object.
   */
  public response: Response

  public constructor(assert: Assert, response: Response) {
    super()

    this.assert = assert
    this.response = response
  }

  /**
   * Assert the status code of the response.
   *
   * @example
   * ```js
   * response.assertStatusCode(200)
   * ```
   */
  public assertStatusCode(statusCode: number) {
    this.assert.deepEqual(this.response.statusCode, statusCode)
  }

  /**
   * Assert the status code is not the same of the response.
   *
   * @example
   * ```js
   * response.assertIsNotStatusCode(200)
   * ```
   */
  public assertIsNotStatusCode(statusCode: number) {
    this.assert.notDeepEqual(this.response.statusCode, statusCode)
  }

  /**
   * Assert body (array or object) to contain a subset of the expected value.
   *
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertBodyContains({ id: 1 }) // passes
   * ```
   * @example
   * ```js
   * const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   * response.assertBodyContains([{ id: 1 }, { id: 2 }]) // passes
   * ```
   */
  public assertBodyContains(values: any | any[]) {
    this.assert.containsSubset(this.response.json(), values)
  }

  /**
   * Assert body (array or object) to not contain a subset of the expected value.
   *
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertBodyNotContains({ id: 1 }) // fails
   * ```
   * @example
   * ```js
   * const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   * response.assertBodyNotContains([{ id: 3 }]) // passes
   * ```
   */
  public assertBodyNotContains(values: any | any[]) {
    this.assert.notContainsSubset(this.response.json(), values)
  }

  /**
   * Assert body to contain a key.
   *
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertBodyContainsKey('id') // passes
   * ```
   */
  public assertBodyContainsKey(key: string) {
    const body = this.response.json()
    const value = Json.get(body, key)

    this.assert.assert(
      value !== undefined,
      `The body does not contain the key ${key}`
    )
  }

  /**
   * Assert body to not contain a key.
   *
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertBodyNotContainsKey('id') // fails
   * ```
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertBodyNotContainsKey('createdAt') // passes
   * ```
   */
  public assertBodyNotContainsKey(key: string) {
    const body = this.response.json()
    const value = Json.get(body, key)

    this.assert.assert(value === undefined, `The body contains the key ${key}`)
  }

  /**
   * Assert body to contain all keys.
   *
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertBodyContainsAllKeys(['id', 'post']) // passes
   * ```
   */
  public assertBodyContainsAllKeys(keys: string[]) {
    const body = this.response.json()
    const seenKeys = new Set()

    for (const key of keys) {
      const value = Json.get(body, key)

      if (value !== undefined) {
        seenKeys.add(key)
      }
    }

    if (seenKeys.size !== keys.length) {
      return this.assert.fail(
        `The body does not contain all keys: ${keys.join(', ')}`
      )
    }
  }

  /**
   * Assert body to not contain all keys.
   *
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertBodyNotContainsAllKeys(['id']) // fails
   * ```
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertBodyNotContainsAllKeys(['createdAt']) // passes
   * ```
   */
  public assertBodyNotContainsAllKeys(keys: string[]) {
    const body = this.response.json()
    const seenKeys = new Set()

    for (const key of keys) {
      const value = Json.get(body, key)

      if (value !== undefined) {
        seenKeys.add(key)
      }
    }

    this.assert.assert(
      !seenKeys.size,
      `The body contains keys: ${Array.from(seenKeys).join(', ')}`
    )
  }

  /**
   * Assert body (array or object) to be deep equal to the expected value.
   *
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertBodyDeepEqual({ id: 1 }) // fails
   * ```
   * @example
   * ```js
   * const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   * response.assertBodyDeepEqual([{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]) // passes
   * ```
   */
  public assertBodyDeepEqual(values: any | any[]) {
    this.assert.deepEqual(this.response.json(), values)
  }

  /**
   * Assert body (array or object) to be not deep equal to the expected value.
   *
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertBodyNotDeepEqual({ id: 1 }) // passes
   * ```
   * @example
   * ```js
   * const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   * response.assertBodyNotDeepEqual([{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]) // fails
   * ```
   */
  public assertBodyNotDeepEqual(values: any | any[]) {
    this.assert.notDeepEqual(this.response.json(), values)
  }

  /**
   * Assert body to be an array.
   *
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertBodyIsArray() // fails
   * ```
   * @example
   * ```js
   * const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   * response.assertBodyIsArray() // passes
   * ```
   */
  public assertBodyIsArray() {
    this.assert.isArray(this.response.json())
  }

  /**
   * Assert body to not be an array.
   *
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertBodyIsNotArray() // passes
   * ```
   * @example
   * ```js
   * const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   * response.assertBodyIsNotArray() // fails
   * ```
   */
  public assertBodyIsNotArray() {
    this.assert.isNotArray(this.response.json())
  }

  /**
   * Assert body to be an object.
   *
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertBodyIsObject() // passes
   * ```
   * @example
   * ```js
   * const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   * response.assertBodyIsObject() // fails
   * ```
   */
  public assertBodyIsObject() {
    this.assert.isObject(this.response.json())
  }

  /**
   * Assert body to not be an object.
   *
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertBodyIsNotObject() // fails
   * ```
   * @example
   * ```js
   * const body = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   * response.assertBodyIsNotObject() // passes
   * ```
   */
  public assertBodyIsNotObject() {
    this.assert.isNotObject(this.response.json())
  }

  /**
   * Assert header (array or object) to contain a subset of the expected value.
   *
   * @example
   * ```js
   * const header = { id: 1, name: 'post 1' }
   *
   * response.assertHeaderContains({ id: 1 }) // passes
   * ```
   * @example
   * ```js
   * const header = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   *  response.assertHeaderContains([{ id: 1 }, { id: 2 }]) // passes
   * ```
   */
  public assertHeaderContains(values: any | any[]) {
    this.assert.containsSubset(this.response.headers, values)
  }

  /**
   * Assert header (array or object) to not contain a subset of the expected value.
   *
   * @example
   * ```js
   * const header = { id: 1, name: 'post 1' }
   *
   * response.assertHeaderContains({ id: 1 }) // passes
   * ```
   * @example
   * ```js
   * const header = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   * response.assertHeaderContains([{ id: 1 }, { id: 2 }]) // passes
   * ```
   */
  public assertHeaderNotContains(values: any | any[]) {
    this.assert.notContainsSubset(this.response.headers, values)
  }

  /**
   * Assert header (array or object) to be deep equal to the expected value.
   *
   * @example
   * ```js
   * const header = { id: 1, name: 'post 1' }
   *
   * response.assertHeaderDeepEqual({ id: 1 }) // fails
   * ```
   * @example
   * ```js
   * const header = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   * response.assertHeaderDeepEqual([{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]) // passes
   * ```
   */
  public assertHeaderDeepEqual(values: any | any[]) {
    this.assert.deepEqual(this.response.headers, values)
  }

  /**
   * Assert header (array or object) to be not deep equal to the expected value.
   *
   * @example
   * ```js
   * const header = { id: 1, name: 'post 1' }
   *
   * response.assertHeaderNotDeepEqual({ id: 1 }) // passes
   * ```
   * @example
   * ```js
   * const header = [{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]
   *
   * response.assertHeaderNotDeepEqual([{ id: 1, name: 'post 1' }, { id: 2, name: 'post 2'}]) // fails
   * ```
   */
  public assertHeaderNotDeepEqual(values: any | any[]) {
    this.assert.notDeepEqual(this.response.headers, values)
  }

  /**
   * Assert header to contain a key.
   *
   * @example
   * ```js
   * const header = { id: 1, name: 'post 1' }
   *
   * response.assertHeaderContainsKey('id') // passes
   * ```
   */
  public assertHeaderContainsKey(key: string) {
    this.assert.property(this.response.headers, key)
  }

  /**
   * Assert header to not contain a key.
   *
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertHeaderNotContainsKey('id') // fails
   * ```
   * @example
   * ```js
   * const body = { id: 1, name: 'post 1' }
   *
   * response.assertHeaderNotContainsKey('createdAt') // passes
   * ```
   */
  public assertHeaderNotContainsKey(key: string) {
    this.assert.notProperty(this.response.headers, key)
  }

  /**
   * Assert header to contain all keys.
   *
   * @example
   * ```js
   * const header = { id: 1, name: 'post 1' }
   *
   * response.assertHeaderContainsAllKeys(['id', 'post']) // passes
   * ```
   */
  public assertHeaderContainsAllKeys(keys: string[]) {
    this.assert.properties(this.response.headers, keys)
  }

  /**
   * Assert header to not contain all keys.
   *
   * @example
   * ```js
   * const header = { id: 1, name: 'post 1' }
   *
   * response.assertHeaderNotContainsAllKeys(['id']) // fails
   * ```
   * @example
   * ```js
   * const header = { id: 1, name: 'post 1' }
   *
   * response.assertHeaderNotContainsAllKeys(['createdAt']) // passes
   * ```
   */
  public assertHeaderNotContainsAllKeys(keys: string[]) {
    this.assert.notAllProperties(this.response.headers, keys)
  }
}
