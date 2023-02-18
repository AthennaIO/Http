/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Route } from '#src/Facades/Route'
import { Server } from '#src/Facades/Server'
import { Middleware } from '#tests/Stubs/middlewares/Middleware'
import { HttpRouteProvider } from '#src/Providers/HttpRouteProvider'
import { HttpServerProvider } from '#src/Providers/HttpServerProvider'
import { HelloController } from '#tests/Stubs/controllers/HelloController'

test.group('RouteTest', group => {
  group.each.setup(async () => {
    new HttpServerProvider().register()
    new HttpRouteProvider().register()

    await Server.plugin(import('@fastify/swagger'), {
      swagger: {
        securityDefinitions: {
          apiKey: {
            type: 'apiKey',
            name: 'apiKey',
            in: 'header',
          },
        },
      },
    })
  })

  group.each.teardown(async () => {
    await new HttpServerProvider().shutdown()
  })

  test('should be able to set vanilla fastify options in route', async ({ assert }) => {
    let errorHappened = false
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.get('test', 'HelloController.vanillaError').vanillaOptions({
      onError: async () => {
        errorHappened = true
      },
    })

    Route.register()
    await Server.request({ path: '/test', method: 'get' })

    assert.isTrue(errorHappened)
  })

  test('should be able to set fastify schema options in route', async ({ assert }) => {
    Route.get('test', new HelloController().index)
      .middleware(new Middleware())
      .schema({
        response: {
          200: {
            properties: { hello: { type: 'string' } },
          },
        },
      })

    Route.register()

    const response = await Server.request({ path: '/test', method: 'get' })

    /**
     * The "handled" property of the middleware will not exist.
     */
    assert.deepEqual(response.json(), { hello: 'world' })
  })

  test('should be able to hide a route from the swagger documentation', async ({ assert }) => {
    Route.get('test', new HelloController().index)
    Route.post('test', new HelloController().store).hide()

    Route.register()

    const swagger = Server.getSwagger()

    assert.deepEqual(swagger.paths['/test'], {
      get: {
        responses: {
          200: { description: 'Default Response' },
        },
      },
    })
  })

  test('should be able to deprecate a route in the swagger documentation', async ({ assert }) => {
    Route.get('test', new HelloController().index).deprecated()

    Route.register()

    const swagger = Server.getSwagger()

    assert.deepEqual(swagger.paths['/test'], {
      get: {
        deprecated: true,
        responses: {
          200: { description: 'Default Response' },
        },
      },
    })
  })

  test('should be able to set a summary in the route for swagger documentation', async ({ assert }) => {
    Route.get('test', new HelloController().index).summary('Summary')

    Route.register()

    const swagger = Server.getSwagger()

    assert.deepEqual(swagger.paths['/test'], {
      get: {
        summary: 'Summary',
        responses: {
          200: { description: 'Default Response' },
        },
      },
    })
  })

  test('should be able to set a description in the route for swagger documentation', async ({ assert }) => {
    Route.get('test', new HelloController().index).description('Description')

    Route.register()

    const swagger = Server.getSwagger()

    assert.deepEqual(swagger.paths['/test'], {
      get: {
        description: 'Description',
        responses: {
          200: { description: 'Default Response' },
        },
      },
    })
  })

  test('should be able to set tags in the route for swagger documentation', async ({ assert }) => {
    Route.get('test', new HelloController().index).tags(['test'])

    Route.register()

    const swagger = Server.getSwagger()

    assert.deepEqual(swagger.paths['/test'], {
      get: {
        tags: ['test'],
        responses: {
          200: { description: 'Default Response' },
        },
      },
    })
  })

  test('should be able to set body param in the route for swagger documentation', async ({ assert }) => {
    Route.post('test', new HelloController().index).body('hello', { description: 'hello prop' })

    Route.register()

    const swagger = Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        responses: { '200': { description: 'Default Response' } },
        parameters: [
          {
            name: 'body',
            in: 'body',
            schema: {
              type: 'object',
              properties: {
                hello: { description: 'hello prop' },
              },
            },
          },
        ],
      },
    })
  })

  test('should be able to set query param in the route for swagger documentation', async ({ assert }) => {
    Route.post('test', new HelloController().index).queryString('hello', { description: 'hello prop' })

    Route.register()

    const swagger = Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        responses: { '200': { description: 'Default Response' } },
        parameters: [
          {
            description: 'hello prop',
            required: false,
            in: 'query',
            name: 'hello',
          },
        ],
      },
    })
  })

  test('should be able to set response code in the route for swagger documentation', async ({ assert }) => {
    Route.post('test', new HelloController().index)
      .response(200, { description: 'Default Response' })
      .response(404, { description: 'not found test' })

    Route.register()

    const swagger = Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        responses: { '200': { description: 'Default Response' }, '404': { description: 'not found test' } },
      },
    })
  })

  test('should be able to set security keys in the route for swagger documentation', async ({ assert }) => {
    Route.post('test', new HelloController().index).security('apiKey', ['123', '321'])

    Route.register()

    const swagger = Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        security: [{ apiKey: ['123', '321'] }],
        responses: { '200': { description: 'Default Response' } },
      },
    })
  })

  test('should be able to set external docs url in the route for swagger documentation', async ({ assert }) => {
    Route.post('test', new HelloController().index).externalDocs('https://athenna.io', 'Athenna documentation')

    Route.register()

    const swagger = Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        responses: { '200': { description: 'Default Response' } },
        externalDocs: { url: 'https://athenna.io', description: 'Athenna documentation' },
      },
    })
  })

  test('should be able to set type of content consumed by the route for swagger documentation', async ({ assert }) => {
    Route.post('test', new HelloController().index).consumes(['json', 'yaml'])

    Route.register()

    const swagger = Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        consumes: ['json', 'yaml'],
        responses: { '200': { description: 'Default Response' } },
      },
    })
  })

  test('should be able to set type of content produced by the route for swagger documentation', async ({ assert }) => {
    Route.post('test', new HelloController().index).produces(['json', 'yaml'])

    Route.register()

    const swagger = Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        produces: ['json', 'yaml'],
        responses: { '200': { description: 'Default Response' } },
      },
    })
  })
})
