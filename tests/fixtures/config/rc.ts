/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, File } from '@athenna/common'

const athennaRc = new File(Path.pwd('package.json')).getContentAsJsonSync().athenna

athennaRc.isInPackageJson = true

export default athennaRc
