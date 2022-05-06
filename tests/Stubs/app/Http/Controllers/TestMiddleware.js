/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class TestMiddleware {
  async handle({ data, next, request }) {
    data.param = 'param'
    request.queries.test = 'middleware'

    return next()
  }

  async intercept({ data, body, request }) {
    data.param = 'param'
    request.queries.test = 'middleware'

    return body
  }

  async terminate({ next }) {
    console.log('Terminate middleware executed!')

    return next()
  }
}
