/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class InterceptMiddleware {
  async intercept({ body }) {
    if (!body.middlewares) body.middlewares = []

    body.middlewares.push('intercept')

    return body
  }
}
