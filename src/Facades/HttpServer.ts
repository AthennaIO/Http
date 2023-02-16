/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Facade } from '@athenna/ioc'
import { Server } from '#src/Server/Server'

export const HttpServer = Facade.createFor<Server>('Athenna/Core/HttpServer')
