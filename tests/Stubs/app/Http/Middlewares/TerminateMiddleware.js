/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class TerminateMiddleware {
  /**
   * Terminate method.
   *
   * @param {import('#src/index').TerminateContextContract} ctx
   * @return {Promise<void>}
   */
  async terminate({ next }) {
    console.log('Request terminated!')

    return next()
  }
}
