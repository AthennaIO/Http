/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Http } from 'src/Http'
import { Facade } from '@athenna/ioc'

export const Server = Facade.createFor<Http>('Athenna/Core/HttpServer')
