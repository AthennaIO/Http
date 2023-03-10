/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Middleware } from '#tests/Stubs/middlewares/Middleware'
import { Test, AfterEach, BeforeEach, TestContext } from '@athenna/test'
import { HelloController } from '#tests/Stubs/controllers/HelloController'
import { Route, Server, HttpRouteProvider, HttpServerProvider } from '#src'

export default class RouteTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

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
  }

  @AfterEach()
  public async afterEach() {
    await new HttpServerProvider().shutdown()
  }

  @Test()
  public async shouldBeAbleToSetVanillaFastifyOptionsInRoute({ assert }: TestContext) {
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
  }

  @Test()
  public async shouldBeAbleToSetFastifySchemaOptionsInRoute({ assert }: TestContext) {
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
  }

  @Test()
  public async shouldBeAbleToHideARouteFromTheSwaggerDocumentation({ assert }: TestContext) {
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
  }

  @Test()
  public async shouldBeAbleToDeprecatedARouteInSwaggerDocumentation({ assert }: TestContext) {
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
  }

  @Test()
  public async shouldBeAbleToSetASummaryInTheRouteForSwaggerDocumentation({ assert }: TestContext) {
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
  }

  @Test()
  public async shouldBeAbleToSetADescriptionInTheRouteForSwaggerDocumentation({ assert }: TestContext) {
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
  }

  @Test()
  public async shouldBeAbleToSetTagsInTheRouteForSwaggerDocumentation({ assert }: TestContext) {
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
  }

  @Test()
  public async shouldBeAbleToSetBodyParamInTheRouteForSwaggerDocumentation({ assert }: TestContext) {
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
  }

  @Test()
  public async shouldBeAbleToSetQueryParamInTheRouteForSwaggerDocumentation({ assert }: TestContext) {
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
  }

  @Test()
  public async shouldBeAbleToSetResponseCodeInTheRouteForSwaggerDocumentation({ assert }: TestContext) {
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
  }

  @Test()
  public async shouldBeAbleToSetSecurityKeysInTheRouteForSwaggerDocumentation({ assert }: TestContext) {
    Route.post('test', new HelloController().index).security('apiKey', ['123', '321'])

    Route.register()

    const swagger = Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        security: [{ apiKey: ['123', '321'] }],
        responses: { '200': { description: 'Default Response' } },
      },
    })
  }

  @Test()
  public async shouldBeAbleToSetExternalDocsUrlInTheRouteForSwaggerDocumentation({ assert }: TestContext) {
    Route.post('test', new HelloController().index).externalDocs('https://athenna.io', 'Athenna documentation')

    Route.register()

    const swagger = Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        responses: { '200': { description: 'Default Response' } },
        externalDocs: { url: 'https://athenna.io', description: 'Athenna documentation' },
      },
    })
  }

  @Test()
  public async shouldBeAbleToSetTypeOfContentConsumedByTheRouteForSwaggerDocumentation({ assert }: TestContext) {
    Route.post('test', new HelloController().index).consumes(['json', 'yaml'])

    Route.register()

    const swagger = Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        consumes: ['json', 'yaml'],
        responses: { '200': { description: 'Default Response' } },
      },
    })
  }

  @Test()
  public async shouldBeAbleToSetTypeOfContentProducedByTheRouteForSwaggerDocumentation({ assert }: TestContext) {
    Route.post('test', new HelloController().index).produces(['json', 'yaml'])

    Route.register()

    const swagger = Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        produces: ['json', 'yaml'],
        responses: { '200': { description: 'Default Response' } },
      },
    })
  }
}
