/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Facade } from '@athenna/ioc'

/**
 * @type {Facade & import('../index.js').Http}
 */
export const Server = Facade.createFor('Athenna/Core/HttpServer')
