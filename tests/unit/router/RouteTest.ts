/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { MyMiddleware } from '#tests/fixtures/middlewares/MyMiddleware'
import { Test, AfterEach, BeforeEach, type Context, Cleanup } from '@athenna/test'
import { HelloController } from '#tests/fixtures/controllers/HelloController'
import { Route, Server, HttpRouteProvider, HttpServerProvider } from '#src'
import { z } from 'zod'

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
  public async shouldBeAbleToUseZodSchemasInRouteSchema({ assert }: Context) {
    Route.post('test/:id', async ctx => {
      await ctx.response.status(201).send({
        id: String(ctx.request.param('id')),
        page: String(ctx.request.query('page')),
        name: ctx.request.input('name')
      })
    }).schema({
      params: z.object({ id: z.coerce.number() }),
      querystring: z.object({ page: z.coerce.number() }),
      body: z.object({ name: z.string() }),
      response: {
        201: z.object({
          id: z.coerce.number(),
          page: z.coerce.number(),
          name: z.string()
        })
      }
    })

    Route.register()

    const response = await Server.request({
      path: '/test/10?page=2',
      method: 'post',
      payload: { name: 'lenon' }
    })

    assert.equal(response.statusCode, 201)
    assert.deepEqual(response.json(), { id: 10, page: 2, name: 'lenon' })

    const swagger = await Server.getSwagger()

    assert.containSubset(swagger.paths['/test/{id}'], {
      post: {
        responses: {
          '201': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                page: { type: 'number' },
                name: { type: 'string' }
              }
            }
          }
        },
        parameters: [
          { in: 'path', name: 'id', type: 'number' },
          { in: 'query', name: 'page', type: 'number' },
          {
            in: 'body',
            schema: {
              type: 'object',
              properties: { name: { type: 'string' } },
              required: ['name']
            }
          }
        ]
      }
    })
  }

  @Test()
  public async shouldAutomaticallyCoerceZodQuerystringAndParams({ assert }: Context) {
    Route.get('users/:id', async ctx => {
      await ctx.response.send({
        id: ctx.request.param('id'),
        limit: ctx.request.query('limit')
      })
    }).schema({
      params: z.object({ id: z.number() }),
      querystring: z.object({ limit: z.number() }),
      response: {
        200: z.object({
          id: z.number(),
          limit: z.number()
        })
      }
    })

    Route.register()

    const response = await Server.request({
      path: '/users/10?limit=2',
      method: 'get'
    })

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { id: 10, limit: 2 })
  }

  @Test()
  @Cleanup(() => Config.set('openapi.paths', {}))
  public async shouldAutomaticallyApplySchemasFromOpenApiConfig({ assert }: Context) {
    Config.set('openapi.paths', {
      '/users/{id}': {
        get: {
          params: z.object({ id: z.number() }),
          querystring: z.object({ limit: z.number() }),
          response: {
            200: z.object({
              id: z.number(),
              limit: z.number()
            })
          }
        }
      }
    })

    Route.get('users/:id', async ctx => {
      await ctx.response.send({
        id: ctx.request.param('id'),
        limit: ctx.request.query('limit')
      })
    })

    Route.register()

    const response = await Server.request({
      path: '/users/10?limit=2',
      method: 'get'
    })

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { id: 10, limit: 2 })
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

    assert.containSubset(swagger.paths['/test'], {
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

    assert.containSubset(swagger.paths['/test'], {
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

    assert.containSubset(swagger.paths['/test'], {
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

    assert.containSubset(swagger.paths['/test'], {
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

    assert.containSubset(swagger.paths['/test'], {
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

    assert.containSubset(swagger.paths['/test'], {
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

    assert.containSubset(swagger.paths['/test'], {
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

    assert.containSubset(swagger.paths['/test'], {
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

    assert.containSubset(swagger.paths['/test'], {
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

    assert.containSubset(swagger.paths['/test'], {
      post: {
        produces: ['json', 'yaml'],
        responses: { '200': { description: 'Default Response' } }
      }
    })
  }

  @Test()
  public async shouldBeAbleToSetDataInTheRoute({ assert }: Context) {
    Route.post('test', new HelloController().data).data({ permission: 'post:create' })

    Route.register()

    const response = await Server.request({ path: '/test', method: 'post' })

    assert.deepEqual(await response.json(), { data: { permission: 'post:create' } })
  }
}
