/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class HandleMiddleware {
  async handle({ data, next }) {
    if (!data.middlewares) data.middlewares = []

    data.middlewares.push('handle')

    return next()
  }
}
