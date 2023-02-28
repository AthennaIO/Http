/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'

export default {
  disks: {},
  templates: {
    register: true,
    paths: {
      controller: Path.pwd('templates/controller.edge'),
      middleware: Path.pwd('templates/middleware.edge'),
      terminator: Path.pwd('templates/terminator.edge'),
      interceptor: Path.pwd('templates/interceptor.edge'),
    },
    useCustom: true,
    customTemplatesPath: Path.resources('templates'),
  },

  edge: {
    cache: false,
  },
}
