/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module 'fastify' {
  interface FastifyRequest {
    data: any
  }

  interface FastifySchema {
    hide?: boolean
    deprecated?: boolean
    tags?: string[]
    description?: string
    summary?: string
    consumes?: string[]
    produces?: string[]
    externalDocs?:
      | import('openapi-types').OpenAPIV2.ExternalDocumentationObject
      | import('openapi-types').OpenAPIV3.ExternalDocumentationObject
    security?: Array<{ [securityLabel: string]: string[] }>
    /**
     * OpenAPI operation unique identifier
     */
    operationId?: string
  }
}

export * from './Context/Request.js'
export * from './Context/Response.js'
export * from './Contracts/MiddlewareContract.js'
export * from './Contracts/TerminatorContract.js'
export * from './Contracts/InterceptorContract.js'
export * from './Decorators/Controller.js'
export * from './Decorators/Middleware.js'
export * from './Decorators/Interceptor.js'
export * from './Decorators/Terminator.js'
export * from './Facades/Route.js'
export * from './Facades/Server.js'
export * from './Providers/HttpRouteProvider.js'
export * from './Providers/HttpServerProvider.js'
export * from './Kernels/HttpKernel.js'
export * from './Handlers/FastifyHandler.js'
export * from './Handlers/HttpExceptionHandler.js'
export * from './Router/Router.js'
export * from './Server/ServerImpl.js'
export * from './Types/Router/RouteJSON.js'
export * from './Types/Router/RouteHandler.js'
export * from './Types/Router/RouteResourceTypes.js'
export * from './Types/Contexts/Context.js'
export * from './Types/Contexts/ErrorContext.js'
export * from './Types/Contexts/TerminateContext.js'
export * from './Types/Contexts/InterceptContext.js'
export * from './Types/Middlewares/MiddlewareHandler.js'
