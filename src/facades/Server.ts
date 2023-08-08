/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Facade } from '@athenna/ioc'
import type { ServerImpl } from '#src/server/ServerImpl'

export const Server = Facade.createFor<ServerImpl>('Athenna/Core/HttpServer')
