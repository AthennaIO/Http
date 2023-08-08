/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { request } from '#src/testing/plugins/index'
import { Runner, assert, specReporter } from '@athenna/test'

Config.set('meta', import.meta.url)

await Runner.setTsEnv()
  .addPlugin(assert())
  .addPlugin(request())
  .addReporter(specReporter())
  .addPath('tests/unit/**/*.ts')
  .setCliArgs(process.argv.slice(2))
  .setGlobalTimeout(10000)
  .run()
