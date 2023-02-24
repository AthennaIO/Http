/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { Path, File } from '@athenna/common'

const buffer = new File(Path.pwd('.athennarc.json')).getContentSync()
const athennaRc = JSON.parse(buffer.toString())

athennaRc.isInPackageJson = false
athennaRc.meta = Config.get('meta')

export default athennaRc
