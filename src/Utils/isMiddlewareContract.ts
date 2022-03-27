/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { MiddlewareContract } from '../Contracts/MiddlewareContract'

export function isMiddlewareContract(
  object: any,
): object is MiddlewareContract {
  return 'handle' in object || 'intercept' in object || 'terminate' in object
}
