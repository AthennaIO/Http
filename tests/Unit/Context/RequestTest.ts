/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Request } from '#src/Context/Request'
import { Test, BeforeEach, TestContext } from '@athenna/test'
import { fastify, FastifyInstance, FastifyRequest } from 'fastify'

export default class RequestTest {
  private server: FastifyInstance = null
  private request: FastifyRequest = null

  @BeforeEach()
  public async beforeEach() {
    this.server = fastify()

    await this.server.post('/test/:id', req => (this.request = req))
    await this.server
      .inject()
      .post('/test/1?query=true')
      .body({ name: 'João', email: 'lenon@athenna.io', other: 'other' })
  }

  @Test()
  public async shouldBeAbleToGetTheRequestId({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.equal(ctx.request.id, 'req-1')
  }

  @Test()
  public async shouldBeAbleToGetTheRequestIp({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.equal(ctx.request.ip, '127.0.0.1')
  }

  @Test()
  public async shouldBeAbleToGetTheRequestHostname({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.equal(ctx.request.hostname, 'localhost:80')
  }

  @Test()
  public async shouldBeAbleToGetTheRequestProtocol({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.equal(ctx.request.protocol, 'http')
  }

  @Test()
  public async shouldBeAbleToGetTheRequestMethod({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.equal(ctx.request.method, 'POST')
  }

  @Test()
  public async shouldBeAbleToGetAllTypesOfUrlsFromTheRequest({ assert }: TestContext) {
    await this.server.listen({ port: 9999 })
    const ctx = { request: new Request(this.request) }

    assert.equal(ctx.request.baseUrl, '/test/1')
    assert.equal(ctx.request.baseHostUrl, 'http://127.0.0.1:9999/test/1')
    assert.equal(ctx.request.routeUrl, '/test/:id')
    assert.equal(ctx.request.routeHostUrl, 'http://127.0.0.1:9999/test/:id')
    assert.equal(ctx.request.originalUrl, '/test/1?query=true')
    assert.equal(ctx.request.originalHostUrl, 'http://127.0.0.1:9999/test/1?query=true')
    await this.server.close()
  }

  @Test()
  public async shouldBeAbleToGetTheRequestBody({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.deepEqual(ctx.request.body, {
      email: 'lenon@athenna.io',
      name: 'João',
      other: 'other',
    })
  }

  @Test()
  public async shouldBeAbleToGetTheRequestParams({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.deepEqual(ctx.request.params, {
      id: '1',
    })
  }

  @Test()
  public async shouldBeAbleToGetTheRequestQueries({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.deepEqual(ctx.request.queries, {
      query: 'true',
    })
  }

  @Test()
  public async shouldBeAbleToGetTheRequestHeaders({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.deepEqual(ctx.request.headers, {
      'content-length': '59',
      'content-type': 'application/json',
      host: 'localhost:80',
      'user-agent': 'lightMyRequest',
    })
  }

  @Test()
  public async shouldBeAbleToGetTheServerPortFromRequest({ assert }: TestContext) {
    await this.server.listen({ port: 9999 })
    const ctx = { request: new Request(this.request) }

    assert.equal(ctx.request.port, 9999)
    await this.server.close()
  }

  @Test()
  public async shouldBeAbleToGetTheServerVersionFromRequest({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.equal(ctx.request.version, '1.1')
  }

  @Test()
  public async shouldBeAbleToGetTheSeparatedValuesFromRequestBody({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.equal(ctx.request.input('name', 'test'), 'João')
    assert.equal(ctx.request.input('not-found.name', 'test'), 'test')
  }

  @Test()
  public async shouldBeAbleToGetTheSeparatedValuesFromRequestParams({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.equal(ctx.request.param('id', 'test'), '1')
    assert.equal(ctx.request.param('not-found', 'test'), 'test')
  }

  @Test()
  public async shouldBeAbleToGetTheSeparatedValuesFromRequestQueries({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.equal(ctx.request.query('query', 'test'), 'true')
    assert.equal(ctx.request.query('not-found', 'test'), 'test')
  }

  @Test()
  public async shouldBeAbleToGetTheSeparatedValuesFromRequestHeaders({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.equal(ctx.request.header('content-type', 'test'), 'application/json')
    assert.equal(ctx.request.header('not-found', 'test'), 'test')
  }

  @Test()
  public async shouldBeAbleToGetOnlyTheSelectedValuesFromRequestBody({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.deepEqual(ctx.request.only(['name', 'email']), { name: 'João', email: 'lenon@athenna.io' })
  }

  @Test()
  public async shouldBeAbleToGetAllTheRequestBodyExceptNameAndEmail({ assert }: TestContext) {
    const ctx = { request: new Request(this.request) }

    assert.deepEqual(ctx.request.except(['name', 'email']), { other: 'other' })
  }
}
