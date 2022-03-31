/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import '@athenna/ioc'

import { Http } from '../../src/Http'
import { Folder, Path } from '@secjs/utils'
import { HttpRouteProvider } from '../../src/Providers/HttpRouteProvider'
import { HttpServerProvider } from '../../src/Providers/HttpServerProvider'
import { BadRequestException } from '../../src/Exceptions/BadRequestException'

describe('\n HttpTest', () => {
  let http: Http

  const handler = async ctx => {
    const data: any = { hello: 'world' }

    if (ctx.data.param) data.param = ctx.data.param
    if (ctx.request.queries.test) data.test = ctx.request.query('test')
    if (ctx.request.queries.throwError) throw new BadRequestException('Testing')

    ctx.response.status(200).send(data)
  }

  beforeEach(async () => {
    new Folder(Path.tests('Stubs/config')).loadSync().copySync(Path.pwd('config'))

    new HttpServerProvider().register()
    new HttpRouteProvider().boot()

    http = ioc.use('Athenna/Core/HttpServer')

    http.get('/test', handler)

    await http.listen()
  })

  afterEach(async () => {
    await http.close()
  })

  it('should be able to execute a request in test route', async () => {
    const response = await http.request().get('/test')

    expect(response.statusCode).toBe(200)
    expect(response.json()).toStrictEqual({ hello: 'world' })
  })

  it('should be able to register a new route with a middleware', async () => {
    const middlewareHttp = new Http()

    await middlewareHttp.use(ctx => {
      ctx.data.param = 'param'
      ctx.request.queries.test = 'middleware'

      ctx.next()
    })

    middlewareHttp.get('/test', handler)

    await middlewareHttp.listen(3030)

    const response = await middlewareHttp.request().get('/test')

    await middlewareHttp.close()

    expect(response.statusCode).toBe(200)
    expect(response.json()).toStrictEqual({
      hello: 'world',
      param: 'param',
      test: 'middleware',
    })
  })

  it('should be able to throw custom errors inside handlers', async () => {
    const errorHttp = new Http()

    errorHttp.get('/test', handler)

    await errorHttp.listen(3030)

    const response = await http.request().get('/test').query({ throwError: 'true' })

    await errorHttp.close()

    expect(response.statusCode).toBe(400)
    expect(response.json().statusCode).toStrictEqual(400)
    expect(response.json().code).toStrictEqual('BAD_REQUEST_ERROR')
    expect(response.json().message).toStrictEqual('Testing')
  })

  it('should be able to register a new route with a intercept middleware', async () => {
    const middlewareHttp = new Http()

    await middlewareHttp.use(ctx => {
      ctx.body.hello = ctx.body.hello.replace('world', 'world-intercepted')

      ctx.next(ctx.body)
    }, 'intercept')

    middlewareHttp.get('/test', handler)

    await middlewareHttp.listen(3030)

    const response = await middlewareHttp.request().get('/test')

    await middlewareHttp.close()

    expect(response.statusCode).toBe(200)
    expect(response.json()).toStrictEqual({
      hello: 'world-intercepted',
    })
  })

  afterEach(() => {
    Folder.safeRemove(Path.pwd('config'))
  })
})
