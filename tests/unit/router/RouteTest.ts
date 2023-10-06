/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { MyMiddleware } from '#tests/fixtures/middlewares/MyMiddleware'
import { Test, AfterEach, BeforeEach, type Context } from '@athenna/test'
import { HelloController } from '#tests/fixtures/controllers/HelloController'
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
            in: 'header'
          }
        }
      }
    })
  }

  @AfterEach()
  public async afterEach() {
    await new HttpServerProvider().shutdown()
  }

  @Test()
  public async shouldBeAbleToSetVanillaFastifyOptionsInRoute({ assert }: Context) {
    let errorHappened = false
    ioc.bind('App/Http/Controllers/HelloController', HelloController)

    Route.get('test', 'HelloController.vanillaError').vanillaOptions({
      onError: async () => {
        errorHappened = true
      }
    })

    Route.register()
    await Server.request({ path: '/test', method: 'get' })

    assert.isTrue(errorHappened)
  }

  @Test()
  public async shouldBeAbleToSetFastifySchemaOptionsInRoute({ assert }: Context) {
    Route.get('test', new HelloController().index)
      .middleware(new MyMiddleware())
      .schema({
        response: {
          200: {
            properties: { hello: { type: 'string' } }
          }
        }
      })

    Route.register()

    const response = await Server.request({ path: '/test', method: 'get' })

    /**
     * The "handled" property of the middleware will not exist.
     */
    assert.deepEqual(response.json(), { hello: 'world' })
  }

  @Test()
  public async shouldBeAbleToHideARouteFromTheSwaggerDocumentation({ assert }: Context) {
    Route.get('test', new HelloController().index)
    Route.post('test', new HelloController().store).hide()

    Route.register()

    const swagger = await Server.getSwagger()

    assert.deepEqual(swagger.paths['/test'], {
      get: {
        responses: {
          200: { description: 'Default Response' }
        }
      }
    })
  }

  @Test()
  public async shouldBeAbleToDeprecatedARouteInSwaggerDocumentation({ assert }: Context) {
    Route.get('test', new HelloController().index).deprecated()

    Route.register()

    const swagger = await Server.getSwagger()

    assert.deepEqual(swagger.paths['/test'], {
      get: {
        deprecated: true,
        responses: {
          200: { description: 'Default Response' }
        }
      }
    })
  }

  @Test()
  public async shouldBeAbleToSetASummaryInTheRouteForSwaggerDocumentation({ assert }: Context) {
    Route.get('test', new HelloController().index).summary('Summary')

    Route.register()

    const swagger = await Server.getSwagger()

    assert.deepEqual(swagger.paths['/test'], {
      get: {
        summary: 'Summary',
        responses: {
          200: { description: 'Default Response' }
        }
      }
    })
  }

  @Test()
  public async shouldBeAbleToSetADescriptionInTheRouteForSwaggerDocumentation({ assert }: Context) {
    Route.get('test', new HelloController().index).description('Description')

    Route.register()

    const swagger = await Server.getSwagger()

    assert.deepEqual(swagger.paths['/test'], {
      get: {
        description: 'Description',
        responses: {
          200: { description: 'Default Response' }
        }
      }
    })
  }

  @Test()
  public async shouldBeAbleToSetTagsInTheRouteForSwaggerDocumentation({ assert }: Context) {
    Route.get('test', new HelloController().index).tags(['test'])

    Route.register()

    const swagger = await Server.getSwagger()

    assert.deepEqual(swagger.paths['/test'], {
      get: {
        tags: ['test'],
        responses: {
          200: { description: 'Default Response' }
        }
      }
    })
  }

  @Test()
  public async shouldBeAbleToSetBodyParamInTheRouteForSwaggerDocumentation({ assert }: Context) {
    Route.post('test', new HelloController().index).body('hello', { description: 'hello prop' })

    Route.register()

    const swagger = await Server.getSwagger()

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
                hello: { description: 'hello prop' }
              }
            }
          }
        ]
      }
    })
  }

  @Test()
  public async shouldBeAbleToSetQueryParamInTheRouteForSwaggerDocumentation({ assert }: Context) {
    Route.post('test', new HelloController().index).queryString('hello', { description: 'hello prop' })

    Route.register()

    const swagger = await Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        responses: { '200': { description: 'Default Response' } },
        parameters: [
          {
            description: 'hello prop',
            required: false,
            in: 'query',
            name: 'hello'
          }
        ]
      }
    })
  }

  @Test()
  public async shouldBeAbleToSetResponseCodeInTheRouteReturningStringForSwaggerDocumentation({ assert }: Context) {
    Route.post('test', new HelloController().index)
      .response(200, { type: 'string', example: 'hello world!' })
      .response(404, { type: 'string', example: 'hello world!' })

    Route.register()

    const swagger = await Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        responses: {
          '200': {
            description: 'Status code 200 response',
            schema: {
              type: 'string',
              description: 'Status code 200 response',
              example: 'hello world!'
            }
          },
          '404': {
            description: 'Status code 404 response',
            schema: {
              type: 'string',
              description: 'Status code 404 response',
              example: 'hello world!'
            }
          }
        }
      }
    })
  }

  @Test()
  public async shouldBeAbleToSetResponseCodeInTheRouteReturningBooleanForSwaggerDocumentation({ assert }: Context) {
    Route.post('test', new HelloController().index)
      .response(200, { type: 'boolean', example: false })
      .response(404, { type: 'boolean', example: true })

    Route.register()

    const swagger = await Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        responses: {
          '200': {
            description: 'Status code 200 response',
            schema: {
              type: 'boolean',
              description: 'Status code 200 response',
              example: false
            }
          },
          '404': {
            description: 'Status code 404 response',
            schema: {
              type: 'boolean',
              description: 'Status code 404 response',
              example: true
            }
          }
        }
      }
    })
  }

  @Test()
  public async shouldBeAbleToSetResponseCodeInTheRouteReturningIntegerForSwaggerDocumentation({ assert }: Context) {
    Route.post('test', new HelloController().index)
      .response(200, { type: 'integer', example: 200 })
      .response(404, { type: 'integer', example: 404 })

    Route.register()

    const swagger = await Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        responses: {
          '200': {
            description: 'Status code 200 response',
            schema: {
              type: 'integer',
              description: 'Status code 200 response',
              example: 200
            }
          },
          '404': {
            description: 'Status code 404 response',
            schema: {
              type: 'integer',
              description: 'Status code 404 response',
              example: 404
            }
          }
        }
      }
    })
  }

  @Test()
  public async shouldBeAbleToSetResponseCodeInTheRouteReturningObjectForSwaggerDocumentation({ assert }: Context) {
    Route.post('test', new HelloController().index)
      .response(200, {
        description: 'Success',
        properties: { hello: { type: 'string' } }
      })
      .response(404, {
        description: 'Not found',
        properties: { hello: { type: 'string' } }
      })

    Route.register()

    const swagger = await Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        responses: {
          '200': {
            description: 'Success',
            schema: {
              type: 'object',
              description: 'Success',
              properties: { hello: { type: 'string' } }
            }
          },
          '404': {
            description: 'Not found',
            schema: {
              type: 'object',
              description: 'Not found',
              properties: { hello: { type: 'string' } }
            }
          }
        }
      }
    })
  }

  @Test()
  public async shouldBeAbleToSetSecurityKeysInTheRouteForSwaggerDocumentation({ assert }: Context) {
    Route.post('test', new HelloController().index).security('apiKey', ['123', '321'])

    Route.register()

    const swagger = await Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        security: [{ apiKey: ['123', '321'] }],
        responses: { '200': { description: 'Default Response' } }
      }
    })
  }

  @Test()
  public async shouldBeAbleToSetExternalDocsUrlInTheRouteForSwaggerDocumentation({ assert }: Context) {
    Route.post('test', new HelloController().index).externalDocs('https://athenna.io', 'Athenna documentation')

    Route.register()

    const swagger = await Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        responses: { '200': { description: 'Default Response' } },
        externalDocs: { url: 'https://athenna.io', description: 'Athenna documentation' }
      }
    })
  }

  @Test()
  public async shouldBeAbleToSetTypeOfContentConsumedByTheRouteForSwaggerDocumentation({ assert }: Context) {
    Route.post('test', new HelloController().index).consumes(['json', 'yaml'])

    Route.register()

    const swagger = await Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        consumes: ['json', 'yaml'],
        responses: { '200': { description: 'Default Response' } }
      }
    })
  }

  @Test()
  public async shouldBeAbleToSetTypeOfContentProducedByTheRouteForSwaggerDocumentation({ assert }: Context) {
    Route.post('test', new HelloController().index).produces(['json', 'yaml'])

    Route.register()

    const swagger = await Server.getSwagger()

    assert.containsSubset(swagger.paths['/test'], {
      post: {
        produces: ['json', 'yaml'],
        responses: { '200': { description: 'Default Response' } }
      }
    })
  }
}
