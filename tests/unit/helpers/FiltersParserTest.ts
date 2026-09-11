/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Test, type Context } from '@athenna/test'
import { FiltersParser } from '#src/helpers/FiltersParser'
import { InvalidFilterException } from '#src/exceptions/InvalidFilterException'

export default class FiltersParserTest {
  @Test()
  public async shouldReturnTheDefaultsWhenNothingIsSent({ assert }: Context) {
    assert.deepEqual(FiltersParser.parse({}), {
      page: 0,
      limit: 10,
      search: '',
      select: [],
      includes: [],
      where: [],
      orderBy: []
    })
  }

  @Test()
  public async shouldParsePageLimitAndSearch({ assert }: Context) {
    const filters = FiltersParser.parse({ page: '2', limit: '25', search: 'lenon' })

    assert.equal(filters.page, 2)
    assert.equal(filters.limit, 25)
    assert.equal(filters.search, 'lenon')
  }

  @Test()
  public async shouldUseTheFirstValueWhenAParameterIsRepeated({ assert }: Context) {
    const filters = FiltersParser.parse({ page: ['3', '4'], search: ['a', 'b'] })

    assert.equal(filters.page, 3)
    assert.equal(filters.search, 'a')
  }

  @Test()
  public async shouldNormalizeInvalidPageAndLimit({ assert }: Context) {
    assert.equal(FiltersParser.parse({ page: '-2' }).page, 0)
    assert.equal(FiltersParser.parse({ page: 'abc' }).page, 0)
    assert.equal(FiltersParser.parse({ limit: '0' }).limit, 10)
    assert.equal(FiltersParser.parse({ limit: 'abc' }).limit, 10)
    assert.equal(FiltersParser.parse({ limit: '2.7' }).limit, 2)
  }

  @Test()
  public async shouldClampTheLimitToMaxLimit({ assert }: Context) {
    assert.equal(FiltersParser.parse({ limit: '500' }, { maxLimit: 50 }).limit, 50)
    assert.equal(FiltersParser.parse({ limit: '20' }, { maxLimit: 50 }).limit, 20)
    assert.equal(FiltersParser.parse({}, { maxLimit: 5 }).limit, 5)
  }

  @Test()
  public async shouldApplyDefaultsOnlyWhenTheParameterIsNotSent({ assert }: Context) {
    const defaults = { limit: 20, orderBy: [{ field: 'createdAt', direction: 'DESC' as const }] }

    const missing = FiltersParser.parse({}, { defaults })
    const sent = FiltersParser.parse({ limit: '5', orderby: 'name' }, { defaults })

    assert.equal(missing.limit, 20)
    assert.deepEqual(missing.orderBy, [{ field: 'createdAt', direction: 'DESC' }])
    assert.equal(sent.limit, 5)
    assert.deepEqual(sent.orderBy, [{ field: 'name', direction: 'ASC' }])
  }

  @Test()
  public async shouldParseSelectAndIncludes({ assert }: Context) {
    const filters = FiltersParser.parse({ select: 'id, name,,email', includes: 'profile,products' })

    assert.deepEqual(filters.select, ['id', 'name', 'email'])
    assert.deepEqual(filters.includes, ['profile', 'products'])
  }

  @Test()
  public async shouldParseOrderByWithDirection({ assert }: Context) {
    const filters = FiltersParser.parse({ orderby: '-createdAt, name,metadata->title' })

    assert.deepEqual(filters.orderBy, [
      { field: 'createdAt', direction: 'DESC' },
      { field: 'name', direction: 'ASC' },
      { field: 'metadata->title', direction: 'ASC' }
    ])
  }

  @Test()
  public async shouldParseWhereTokensWithEveryValueType({ assert }: Context) {
    const filters = FiltersParser.parse({
      where: [
        'status:=:active',
        'age:>:18',
        'rate:<=:2.5',
        'negative:=:-3',
        'enabled:=:true',
        'deletedAt:=:null',
        'tags:in:a__b__c',
        'ids:in:[1,2]',
        'meta:=:{"a":1}',
        'name:contains:"Doe, John"',
        'time:=:10:30'
      ].join(',')
    })

    assert.deepEqual(filters.where, [
      { field: 'status', op: '=', value: 'active' },
      { field: 'age', op: '>', value: 18 },
      { field: 'rate', op: '<=', value: 2.5 },
      { field: 'negative', op: '=', value: -3 },
      { field: 'enabled', op: '=', value: true },
      { field: 'deletedAt', op: '=', value: null },
      { field: 'tags', op: 'in', value: ['a', 'b', 'c'] },
      { field: 'ids', op: 'in', value: [1, 2] },
      { field: 'meta', op: '=', value: { a: 1 } },
      { field: 'name', op: 'contains', value: 'Doe, John' },
      { field: 'time', op: '=', value: '10:30' }
    ])
  }

  @Test()
  public async shouldSplitWhereTokensRespectingQuotesAndBrackets({ assert }: Context) {
    assert.deepEqual(FiltersParser.splitWhereTokens(`a:=:"x,y",b:in:[1,2],c:=:{"k":"v,w"},d:=:'q,r'`), [
      'a:=:"x,y"',
      'b:in:[1,2]',
      'c:=:{"k":"v,w"}',
      "d:=:'q,r'"
    ])
    assert.deepEqual(FiltersParser.splitWhereTokens('a:=:1, ,b:=:2,'), ['a:=:1', 'b:=:2'])
    assert.deepEqual(FiltersParser.splitWhereTokens(''), [])
  }

  @Test()
  public async shouldKeepMalformedJsonAsString({ assert }: Context) {
    assert.equal(FiltersParser.parseValue('[1,2'), '[1,2')
    assert.equal(FiltersParser.parseValue('{a:1}'), '{a:1}')
  }

  @Test()
  public async shouldDecodeUriComponentsAndKeepInvalidOnes({ assert }: Context) {
    assert.equal(FiltersParser.parseValue('a%20b'), 'a b')
    assert.equal(FiltersParser.parseValue('100%'), '100%')
  }

  @Test()
  public async shouldParseRelationAndJsonPathFields({ assert }: Context) {
    const filters = FiltersParser.parse({ where: 'avatar.name:=:x,metadata->mode:=:y' })

    assert.deepEqual(filters.where, [
      { field: 'avatar.name', op: '=', value: 'x' },
      { field: 'metadata->mode', op: '=', value: 'y' }
    ])
  }

  @Test()
  public async shouldThrowInvalidFilterExceptionForFieldsNotAllowedByDefault({ assert }: Context) {
    assert.throws(() => FiltersParser.parse({ where: 'password:=:x' }, { where: ['name'] }), InvalidFilterException)
    assert.throws(() => FiltersParser.parse({ orderby: '-password' }, { orderBy: ['name'] }), InvalidFilterException)
    assert.throws(() => FiltersParser.parse({ select: 'password' }, { select: ['name'] }), InvalidFilterException)
    assert.throws(() => FiltersParser.parse({ includes: 'secrets' }, { includes: ['profile'] }), InvalidFilterException)
  }

  @Test()
  public async shouldDescribeTheParameterAndValueInTheException({ assert }: Context) {
    try {
      FiltersParser.parse({ where: 'password:=:x' }, { where: ['name'] })
      assert.fail('Should have thrown')
    } catch (error) {
      assert.instanceOf(error, InvalidFilterException)
      assert.equal(error.status, 422)
      assert.equal(error.code, 'E_INVALID_FILTER')
      assert.include(error.message, '"password"')
      assert.include(error.message, '"where"')
    }
  }

  @Test()
  public async shouldIgnoreValuesNotAllowedWhenOnDeniedIsIgnore({ assert }: Context) {
    const filters = FiltersParser.parse(
      {
        where: 'password:=:x,name:=:y',
        orderby: '-password,name',
        select: 'password,name',
        includes: 'secrets,profile'
      },
      { where: ['name'], orderBy: ['name'], select: ['name'], includes: ['profile'], onDenied: 'ignore' }
    )

    assert.deepEqual(filters.where, [{ field: 'name', op: '=', value: 'y' }])
    assert.deepEqual(filters.orderBy, [{ field: 'name', direction: 'ASC' }])
    assert.deepEqual(filters.select, ['name'])
    assert.deepEqual(filters.includes, ['profile'])
  }

  @Test()
  public async shouldAllowEverythingWhenTheListIsNotSet({ assert }: Context) {
    const filters = FiltersParser.parse({ where: 'password:=:x', orderby: '-password' }, { select: ['name'] })

    assert.deepEqual(filters.where, [{ field: 'password', op: '=', value: 'x' }])
    assert.deepEqual(filters.orderBy, [{ field: 'password', direction: 'DESC' }])
  }

  @Test()
  public async shouldTreatMalformedWhereTokensAsDenied({ assert }: Context) {
    assert.throws(() => FiltersParser.parse({ where: 'name:like:x' }), InvalidFilterException)
    assert.throws(() => FiltersParser.parse({ where: 'name' }), InvalidFilterException)
    assert.deepEqual(FiltersParser.parse({ where: 'name:like:x,age:>:1' }, { onDenied: 'ignore' }).where, [
      { field: 'age', op: '>', value: 1 }
    ])
  }

  @Test()
  public async shouldDropTheSearchTermWhenSearchIsDisabled({ assert }: Context) {
    assert.equal(FiltersParser.parse({ search: 'lenon' }, { search: false }).search, '')
  }
}
