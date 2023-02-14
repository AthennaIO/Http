/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export default {
  default: 'console',

  channels: {
    console: {
      driver: 'null',
      level: 'trace',
      formatter: 'cli',
    },

    exception: {
      driver: 'null',
      level: 'trace',
      streamType: 'stderr',
      formatter: 'none',
    },
  },
}
