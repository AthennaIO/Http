/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Router } from 'src/Router/Router'
import { Handler } from 'src/Utils/Handler'

export const Route: Router = new Proxy(
  {},
  new Handler('Athenna/Core/HttpRoute'),
)
