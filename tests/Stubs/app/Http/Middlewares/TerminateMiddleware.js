/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class TerminateMiddleware {
  async terminate({ next }) {
    console.log('Request terminated!')

    return next()
  }
}
