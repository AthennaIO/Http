/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Verify if the middleware implements the middleware contract.
 *
 * @param {any} object
 */
export function isMiddlewareContract(object) {
  return 'handle' in object || 'intercept' in object || 'terminate' in object
}
