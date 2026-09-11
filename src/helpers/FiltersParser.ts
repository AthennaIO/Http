/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is, Filters, Options } from '@athenna/common'
import type { Where, OrderBy, FilterOptions } from '@athenna/common/types'
import { InvalidFilterException } from '#src/exceptions/InvalidFilterException'
import type { RequestFiltersOptions } from '#src/types/request/RequestFiltersOptions'

export class FiltersParser {
  /**
   * Parse the list filters of a query string object into a
   * `FilterOptions`, authorizing each value against the allowed
   * lists of `options`. See `Request.filters()`.
   */
  public static parse(
    queries: Record<string, any>,
    options: RequestFiltersOptions = {}
  ): FilterOptions {
    options = Options.create(options, {
      search: true,
      onDenied: 'throw',
      defaults: {}
    })

    const defaults: Partial<FilterOptions> = {
      page: 0,
      limit: 10,
      search: '',
      select: [],
      includes: [],
      where: [],
      orderBy: [],
      ...options.defaults
    }

    const page = FiltersParser.parseNumber(queries, 'page', defaults.page)
    const limit = FiltersParser.parseNumber(queries, 'limit', defaults.limit)

    return {
      page: Math.max(0, page),
      limit: FiltersParser.clampLimit(limit, defaults.limit, options.maxLimit),
      search: options.search
        ? FiltersParser.first(queries, 'search') ?? defaults.search
        : '',
      select: FiltersParser.parseList(
        queries,
        'select',
        options,
        defaults.select
      ),
      includes: FiltersParser.parseList(
        queries,
        'includes',
        options,
        defaults.includes
      ),
      where: FiltersParser.parseWhere(queries, options, defaults.where),
      orderBy: FiltersParser.parseOrderBy(queries, options, defaults.orderBy)
    }
  }

  /**
   * Split a `where` query string into tokens, respecting quotes
   * and JSON brackets so `name:=:"a,b"` and `tags:in:["a","b"]`
   * are single tokens.
   */
  public static splitWhereTokens(where?: string) {
    if (!where) {
      return []
    }

    const tokens: string[] = []
    let token = ''
    let depth = 0
    let escaped = false
    let quote: string | null = null

    for (const char of where) {
      if (escaped) {
        token += char
        escaped = false
        continue
      }

      if (quote && char === '\\') {
        token += char
        escaped = true
        continue
      }

      if (char === '"' || char === "'") {
        if (quote === char) {
          quote = null
        } else if (!quote) {
          quote = char
        }

        token += char
        continue
      }

      if (!quote) {
        if (char === '[' || char === '{') {
          depth += 1
        } else if (char === ']' || char === '}') {
          depth = Math.max(0, depth - 1)
        } else if (char === ',' && depth === 0) {
          tokens.push(token)
          token = ''
          continue
        }
      }

      token += char
    }

    tokens.push(token)

    return tokens.map(token => token.trim()).filter(Boolean)
  }

  /**
   * Parse the raw value of a `where` token: `null`, inline JSON
   * (`[...]`/`{...}`), numbers, booleans, `a__b` arrays and quoted
   * strings. Anything else is kept as string.
   */
  public static parseValue(raw: string): any {
    let value = raw

    try {
      value = decodeURIComponent(raw)
    } catch (_error) {
      value = raw
    }

    if (value === 'null') {
      return null
    }

    if (
      (value.startsWith('[') && value.endsWith(']')) ||
      (value.startsWith('{') && value.endsWith('}'))
    ) {
      try {
        return JSON.parse(value)
      } catch (_error) {
        return value
      }
    }

    if (
      value.length >= 2 &&
      (value.startsWith('"') || value.startsWith("'")) &&
      value.endsWith(value[0])
    ) {
      return value.slice(1, -1)
    }

    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return Number(value)
    }

    if (value === 'true' || value === 'false') {
      return value === 'true'
    }

    if (value.includes('__')) {
      return value.split('__')
    }

    return value
  }

  /**
   * Get the first value of a query parameter as string, since a
   * repeated parameter arrives as an array.
   */
  private static first(queries: Record<string, any>, key: string) {
    const value = queries?.[key]

    if (!Is.Defined(value) || value === '') {
      return undefined
    }

    if (Is.Array(value)) {
      return Is.Defined(value[0]) ? String(value[0]) : undefined
    }

    return String(value)
  }

  private static parseNumber(
    queries: Record<string, any>,
    key: string,
    fallback: number
  ) {
    const value = Number(FiltersParser.first(queries, key))

    return Number.isFinite(value) ? Math.trunc(value) : fallback
  }

  private static clampLimit(limit: number, fallback: number, max?: number) {
    if (limit <= 0) {
      limit = fallback
    }

    if (max && limit > max) {
      return max
    }

    return limit
  }

  private static parseList(
    queries: Record<string, any>,
    key: 'select' | 'includes',
    options: RequestFiltersOptions,
    fallback: string[]
  ) {
    const raw = FiltersParser.first(queries, key)

    if (!Is.Defined(raw)) {
      return [...fallback]
    }

    return raw
      .split(',')
      .map(value => value.trim())
      .filter(Boolean)
      .filter(value => FiltersParser.allow(key, value, options[key], options))
  }

  private static parseWhere(
    queries: Record<string, any>,
    options: RequestFiltersOptions,
    fallback: Where[]
  ) {
    const raw = FiltersParser.first(queries, 'where')

    if (!Is.Defined(raw)) {
      return [...fallback]
    }

    return FiltersParser.splitWhereTokens(raw).reduce((where, token) => {
      const [field, op, ...rest] = token.split(':')

      if (!field || !Filters.isOperator(op)) {
        FiltersParser.deny('where', token, options)

        return where
      }

      if (!FiltersParser.allow('where', field, options.where, options)) {
        return where
      }

      where.push({ field, op, value: FiltersParser.parseValue(rest.join(':')) })

      return where
    }, [] as Where[])
  }

  private static parseOrderBy(
    queries: Record<string, any>,
    options: RequestFiltersOptions,
    fallback: OrderBy[]
  ) {
    const raw = FiltersParser.first(queries, 'orderby')

    if (!Is.Defined(raw)) {
      return [...fallback]
    }

    return raw
      .split(',')
      .map(value => value.trim())
      .filter(Boolean)
      .map(value => {
        const isDesc = value.startsWith('-')

        return {
          field: (isDesc ? value.slice(1) : value).trim(),
          direction: isDesc ? 'DESC' : 'ASC'
        } as OrderBy
      })
      .filter(({ field }) =>
        FiltersParser.allow('orderby', field, options.orderBy, options)
      )
  }

  /**
   * Check if a value is in the allowed list, denying it otherwise.
   * An undefined list allows everything.
   */
  private static allow(
    parameter: string,
    value: string,
    allowed: string[] | undefined,
    options: RequestFiltersOptions
  ) {
    if (!allowed || allowed.includes(value)) {
      return true
    }

    FiltersParser.deny(parameter, value, options)

    return false
  }

  private static deny(
    parameter: string,
    value: string,
    options: RequestFiltersOptions
  ) {
    if (options.onDenied === 'ignore') {
      return
    }

    throw new InvalidFilterException(parameter, value)
  }
}
