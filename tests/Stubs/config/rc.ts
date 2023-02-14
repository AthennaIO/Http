/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, File } from '@athenna/common'

const buffer = new File(Path.pwd('package.json')).getContentSync()
const athennaRc = JSON.parse(buffer.toString()).athenna

athennaRc.isInPackageJson = true

export default athennaRc
