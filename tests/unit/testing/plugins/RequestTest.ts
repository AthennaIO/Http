/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Server, HttpServerProvider } from '#src'
import { Test, AfterAll, BeforeAll, type Context } from '@athenna/test'

export default class TestRequestTest {
  @BeforeAll()
  public async beforeEach() {
    ioc.reconstruct()

    new HttpServerProvider().register()

    Server.get({
      url: '/test',
      handler: ctx =>
        ctx.response
          .status(200)
          .header('hello', 'world')
          .header('helloo', 'worldd')
          .header('hellooo', 'worlddd')
          .send({ hello: 'world', helloo: 'worldd', hellooo: 'worlddd' }),
    })

    Server.get({
      url: '/test/array',
      handler: ctx =>
        ctx.response
          .status(200)
          .header('hello', 'world')
          .header('helloo', 'worldd')
          .header('hellooo', 'worlddd')
          .send([{ hello: 'world', helloo: 'worldd', hellooo: 'worlddd' }]),
    })

    Server.head({
      url: '/test',
      handler: ctx =>
        ctx.response
          .status(200)
          .header('hello', 'world')
          .header('helloo', 'worldd')
          .header('hellooo', 'worlddd')
          .send({ hello: 'world', helloo: 'worldd', hellooo: 'worlddd' }),
    })

    Server.options({
      url: '/test',
      handler: ctx =>
        ctx.response
          .status(200)
          .header('hello', 'world')
          .header('helloo', 'worldd')
          .header('hellooo', 'worlddd')
          .send({ hello: 'world', helloo: 'worldd', hellooo: 'worlddd' }),
    })

    Server.post({
      url: '/test',
      handler: ctx =>
        ctx.response
          .status(201)
          .header('hello', 'world')
          .header('helloo', 'worldd')
          .header('hellooo', 'worlddd')
          .send({ hello: 'world', helloo: 'worldd', hellooo: 'worlddd', ...ctx.request.body }),
    })

    Server.put({
      url: '/test',
      handler: ctx =>
        ctx.response
          .status(200)
          .header('hello', 'world')
          .header('helloo', 'worldd')
          .header('hellooo', 'worlddd')
          .send({ hello: 'world', helloo: 'worldd', hellooo: 'worlddd', ...ctx.request.body }),
    })

    Server.delete({
      url: '/test',
      handler: ctx =>
        ctx.response
          .status(200)
          .header('hello', 'world')
          .header('helloo', 'worldd')
          .header('hellooo', 'worlddd')
          .send({ hello: 'world', helloo: 'worldd', hellooo: 'worlddd' }),
    })

    Server.patch({
      url: '/test',
      handler: ctx =>
        ctx.response
          .status(200)
          .header('hello', 'world')
          .header('helloo', 'worldd')
          .header('hellooo', 'worlddd')
          .send({ hello: 'world', helloo: 'worldd', hellooo: 'worlddd' }),
    })
  }

  @AfterAll()
  public async afterAll() {
    await new HttpServerProvider().shutdown()
  }

  @Test()
  public async shouldBeAbleToMakeAGetRequestUsingRequestPlugin({ request }: Context) {
    const response = await request.get('/test')

    response.assertStatusCode(200)
    response.assertIsNotStatusCode(404)
    response.assertBodyIsObject()
    response.assertBodyIsNotArray()
    response.assertBodyContains({ hello: 'world' })
    response.assertBodyNotContains({ helloooo: 'worldddd' })
    response.assertBodyContainsKey('hello')
    response.assertBodyNotContainsKey('helloooo')
    response.assertBodyContainsAllKeys(['hello', 'helloo', 'hellooo'])
    response.assertBodyNotContainsAllKeys(['helloooo', 'hellooooo', 'helloooooo'])
    response.assertBodyDeepEqual({ hello: 'world', helloo: 'worldd', hellooo: 'worlddd' })
    response.assertBodyNotDeepEqual({ helloooo: 'worldddd' })
    response.assertHeaderContains({ hello: 'world' })
    response.assertHeaderNotContains({ helloooo: 'worldddd' })
    response.assertHeaderContainsKey('hello')
    response.assertHeaderNotContainsKey('helloooo')
    response.assertHeaderContainsAllKeys(['hello', 'helloo', 'hellooo'])
    response.assertHeaderNotContainsAllKeys(['helloooo', 'hellooooo', 'helloooooo'])
    response.assertHeaderNotDeepEqual({ helloooo: 'worldddd' })
  }

  @Test()
  public async shouldBeAbleToMakeAHeadRequestUsingRequestPlugin({ request }: Context) {
    const response = await request.head('/test')

    response.assertStatusCode(200)
    response.assertIsNotStatusCode(404)
    response.assertBodyIsObject()
    response.assertBodyIsNotArray()
    response.assertBodyContains({ hello: 'world' })
    response.assertBodyNotContains({ helloooo: 'worldddd' })
    response.assertBodyContainsKey('hello')
    response.assertBodyNotContainsKey('helloooo')
    response.assertBodyContainsAllKeys(['hello', 'helloo', 'hellooo'])
    response.assertBodyNotContainsAllKeys(['helloooo', 'hellooooo', 'helloooooo'])
    response.assertBodyDeepEqual({ hello: 'world', helloo: 'worldd', hellooo: 'worlddd' })
    response.assertBodyNotDeepEqual({ helloooo: 'worldddd' })
    response.assertHeaderContains({ hello: 'world' })
    response.assertHeaderNotContains({ helloooo: 'worldddd' })
    response.assertHeaderContainsKey('hello')
    response.assertHeaderNotContainsKey('helloooo')
    response.assertHeaderContainsAllKeys(['hello', 'helloo', 'hellooo'])
    response.assertHeaderNotContainsAllKeys(['helloooo', 'hellooooo', 'helloooooo'])
    response.assertHeaderNotDeepEqual({ helloooo: 'worldddd' })
  }

  @Test()
  public async shouldBeAbleToMakeAnOptionsRequestUsingRequestPlugin({ request }: Context) {
    const response = await request.options('/test')

    response.assertStatusCode(200)
    response.assertIsNotStatusCode(404)
    response.assertBodyIsObject()
    response.assertBodyIsNotArray()
    response.assertBodyContains({ hello: 'world' })
    response.assertBodyNotContains({ helloooo: 'worldddd' })
    response.assertBodyContainsKey('hello')
    response.assertBodyNotContainsKey('helloooo')
    response.assertBodyContainsAllKeys(['hello', 'helloo', 'hellooo'])
    response.assertBodyNotContainsAllKeys(['helloooo', 'hellooooo', 'helloooooo'])
    response.assertBodyDeepEqual({ hello: 'world', helloo: 'worldd', hellooo: 'worlddd' })
    response.assertBodyNotDeepEqual({ helloooo: 'worldddd' })
    response.assertHeaderContains({ hello: 'world' })
    response.assertHeaderNotContains({ helloooo: 'worldddd' })
    response.assertHeaderContainsKey('hello')
    response.assertHeaderNotContainsKey('helloooo')
    response.assertHeaderContainsAllKeys(['hello', 'helloo', 'hellooo'])
    response.assertHeaderNotContainsAllKeys(['helloooo', 'hellooooo', 'helloooooo'])
    response.assertHeaderNotDeepEqual({ helloooo: 'worldddd' })
  }

  @Test()
  public async shouldBeAbleToMakeAPostRequestUsingRequestPlugin({ request }: Context) {
    const response = await request.post('/test')

    response.assertStatusCode(201)
    response.assertIsNotStatusCode(404)
    response.assertBodyIsObject()
    response.assertBodyIsNotArray()
    response.assertBodyContains({ hello: 'world' })
    response.assertBodyNotContains({ helloooo: 'worldddd' })
    response.assertBodyContainsKey('hello')
    response.assertBodyNotContainsKey('helloooo')
    response.assertBodyContainsAllKeys(['hello', 'helloo', 'hellooo'])
    response.assertBodyNotContainsAllKeys(['helloooo', 'hellooooo', 'helloooooo'])
    response.assertBodyDeepEqual({ hello: 'world', helloo: 'worldd', hellooo: 'worlddd' })
    response.assertBodyNotDeepEqual({ helloooo: 'worldddd' })
    response.assertHeaderContains({ hello: 'world' })
    response.assertHeaderNotContains({ helloooo: 'worldddd' })
    response.assertHeaderContainsKey('hello')
    response.assertHeaderNotContainsKey('helloooo')
    response.assertHeaderContainsAllKeys(['hello', 'helloo', 'hellooo'])
    response.assertHeaderNotContainsAllKeys(['helloooo', 'hellooooo', 'helloooooo'])
    response.assertHeaderNotDeepEqual({ helloooo: 'worldddd' })
  }

  @Test()
  public async shouldBeAbleToMakeAPutRequestUsingRequestPlugin({ request }: Context) {
    const response = await request.put('/test')

    response.assertStatusCode(200)
    response.assertIsNotStatusCode(404)
    response.assertBodyIsObject()
    response.assertBodyIsNotArray()
    response.assertBodyContains({ hello: 'world' })
    response.assertBodyNotContains({ helloooo: 'worldddd' })
    response.assertBodyContainsKey('hello')
    response.assertBodyNotContainsKey('helloooo')
    response.assertBodyContainsAllKeys(['hello', 'helloo', 'hellooo'])
    response.assertBodyNotContainsAllKeys(['helloooo', 'hellooooo', 'helloooooo'])
    response.assertBodyDeepEqual({ hello: 'world', helloo: 'worldd', hellooo: 'worlddd' })
    response.assertBodyNotDeepEqual({ helloooo: 'worldddd' })
    response.assertHeaderContains({ hello: 'world' })
    response.assertHeaderNotContains({ helloooo: 'worldddd' })
    response.assertHeaderContainsKey('hello')
    response.assertHeaderNotContainsKey('helloooo')
    response.assertHeaderContainsAllKeys(['hello', 'helloo', 'hellooo'])
    response.assertHeaderNotContainsAllKeys(['helloooo', 'hellooooo', 'helloooooo'])
    response.assertHeaderNotDeepEqual({ helloooo: 'worldddd' })
  }

  @Test()
  public async shouldBeAbleToMakeADeleteRequestUsingRequestPlugin({ request }: Context) {
    const response = await request.delete('/test')

    response.assertStatusCode(200)
    response.assertIsNotStatusCode(404)
    response.assertBodyIsObject()
    response.assertBodyIsNotArray()
    response.assertBodyContains({ hello: 'world' })
    response.assertBodyNotContains({ helloooo: 'worldddd' })
    response.assertBodyContainsKey('hello')
    response.assertBodyNotContainsKey('helloooo')
    response.assertBodyContainsAllKeys(['hello', 'helloo', 'hellooo'])
    response.assertBodyNotContainsAllKeys(['helloooo', 'hellooooo', 'helloooooo'])
    response.assertBodyDeepEqual({ hello: 'world', helloo: 'worldd', hellooo: 'worlddd' })
    response.assertBodyNotDeepEqual({ helloooo: 'worldddd' })
    response.assertHeaderContains({ hello: 'world' })
    response.assertHeaderNotContains({ helloooo: 'worldddd' })
    response.assertHeaderContainsKey('hello')
    response.assertHeaderNotContainsKey('helloooo')
    response.assertHeaderContainsAllKeys(['hello', 'helloo', 'hellooo'])
    response.assertHeaderNotContainsAllKeys(['helloooo', 'hellooooo', 'helloooooo'])
    response.assertHeaderNotDeepEqual({ helloooo: 'worldddd' })
  }

  @Test()
  public async shouldBeAbleToMakeAPatchRequestUsingRequestPlugin({ request }: Context) {
    const response = await request.patch('/test')

    response.assertStatusCode(200)
    response.assertIsNotStatusCode(404)
    response.assertBodyIsObject()
    response.assertBodyIsNotArray()
    response.assertBodyContains({ hello: 'world' })
    response.assertBodyNotContains({ helloooo: 'worldddd' })
    response.assertBodyContainsKey('hello')
    response.assertBodyNotContainsKey('helloooo')
    response.assertBodyContainsAllKeys(['hello', 'helloo', 'hellooo'])
    response.assertBodyNotContainsAllKeys(['helloooo', 'hellooooo', 'helloooooo'])
    response.assertBodyDeepEqual({ hello: 'world', helloo: 'worldd', hellooo: 'worlddd' })
    response.assertBodyNotDeepEqual({ helloooo: 'worldddd' })
    response.assertHeaderContains({ hello: 'world' })
    response.assertHeaderNotContains({ helloooo: 'worldddd' })
    response.assertHeaderContainsKey('hello')
    response.assertHeaderNotContainsKey('helloooo')
    response.assertHeaderContainsAllKeys(['hello', 'helloo', 'hellooo'])
    response.assertHeaderNotContainsAllKeys(['helloooo', 'hellooooo', 'helloooooo'])
    response.assertHeaderNotDeepEqual({ helloooo: 'worldddd' })
  }

  @Test()
  public async shouldBeAbleToMakeAGetRequestThatReturnsAnArrayUsingRequestPlugin({ request }: Context) {
    const response = await request.get('/test/array')

    response.assertStatusCode(200)
    response.assertIsNotStatusCode(404)
    response.assertBodyIsArray()
    response.assertBodyIsNotObject()
    response.assertBodyContains([{ hello: 'world' }])
    response.assertBodyNotContains([{ helloooo: 'worldddd' }])
    response.assertBodyDeepEqual([{ hello: 'world', helloo: 'worldd', hellooo: 'worlddd' }])
    response.assertBodyNotDeepEqual([{ helloooo: 'worldddd' }])
    response.assertHeaderContains({ hello: 'world' })
    response.assertHeaderNotContains({ helloooo: 'worldddd' })
    response.assertHeaderContainsKey('hello')
    response.assertHeaderNotContainsKey('helloooo')
    response.assertHeaderContainsAllKeys(['hello', 'helloo', 'hellooo'])
    response.assertHeaderNotContainsAllKeys(['helloooo', 'hellooooo', 'helloooooo'])
    response.assertHeaderNotDeepEqual({ helloooo: 'worldddd' })
  }
}
