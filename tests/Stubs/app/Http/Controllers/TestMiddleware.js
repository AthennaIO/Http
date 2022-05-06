/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class TestMiddleware {
  /**
   * Handle method.
   *
   * @param {import('#src/index').HandleContextContract} ctx
   * @return {Promise<void>}
   */
  async handle({ data, next, request }) {
    data.param = 'param'
    request.queries.test = 'middleware'

    return next()
  }

  /**
   * Intercept method.
   *
   * @param {import('#src/index').InterceptContextContract} ctx
   * @return {Promise<void>}
   */
  async intercept({ data, body, request }) {
    data.param = 'param'
    request.queries.test = 'middleware'

    return body
  }

  /**
   * Terminate method.
   *
   * @param {import('#src/index').TerminateContextContract} ctx
   * @return {Promise<void>}
   */
  async terminate({ next }) {
    console.log('Terminate middleware executed!')

    return next()
  }
}
