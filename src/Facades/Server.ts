/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Http } from 'src/Http'
import { Handler } from 'src/Utils/Handler'

export const Server: Http = new Proxy(
  {},
  new Handler('Athenna/Core/HttpServer'),
)
