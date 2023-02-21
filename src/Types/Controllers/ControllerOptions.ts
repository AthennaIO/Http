/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type ControllerOptions = {
  alias?: string
  type?: 'fake' | 'scoped' | 'singleton' | 'transient'
}
