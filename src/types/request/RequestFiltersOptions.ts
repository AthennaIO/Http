/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { FilterOptions } from '@athenna/common/types'

export type RequestFiltersOptions = {
  /**
   * The columns the client is allowed to `select`. When not set,
   * any column is allowed.
   */
  select?: string[]

  /**
   * The relations the client is allowed to load with `includes`.
   * When not set, any relation is allowed.
   */
  includes?: string[]

  /**
   * The fields the client is allowed to filter with `where`,
   * matching the `field` part of `field:op:value` exactly (so
   * `avatar.name` and `metadata->mode` must be listed as such).
   * When not set, any field is allowed.
   */
  where?: string[]

  /**
   * The fields the client is allowed to sort with `orderby`. When
   * not set, any field is allowed.
   */
  orderBy?: string[]

  /**
   * Whether the `search` term is accepted. `false` always returns
   * an empty term.
   *
   * @default true
   */
  search?: boolean

  /**
   * The maximum value accepted in `limit`. Bigger values are
   * clamped to it.
   */
  maxLimit?: number

  /**
   * The values used when the client does not send the parameter.
   *
   * @default { page: 0, limit: 10 }
   */
  defaults?: Partial<FilterOptions>

  /**
   * What to do when the client sends something that is not
   * allowed: `throw` raises an `InvalidFilterException` (422,
   * `E_INVALID_FILTER`) saying which parameter and value, `ignore`
   * silently drops it.
   *
   * @default 'throw'
   */
  onDenied?: 'throw' | 'ignore'
}
