/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { fork } from 'node:child_process'
import { Logger } from '#tests/helpers/Logger'
import { Cannon } from '#tests/helpers/Cannon'

const __dirname = dirname(fileURLToPath(import.meta.url))

Logger.title(' ATHENNA ')
const forked = fork(join(__dirname, '../fixtures/server/main.ts'))

await Logger.spinner(Cannon.coolOff, 'BOOTING ATHENNA APP')

Logger.line()
Logger.title(' ATHENNA RUN 1 ')
await Cannon.run('http://localhost:3330')

Logger.line()
await Logger.spinner(Cannon.coolOff, 'COOLING OFF')

Logger.line()
Logger.title(' ATHENNA RUN 2 ')
await Cannon.run('http://localhost:3330')

forked.kill('SIGINT')
Logger.title('\n ATHENNA DONE! \n')

await Cannon.coolOff()
