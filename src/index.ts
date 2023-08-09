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

  interface FastifyReply {
    body: any | any[]
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

export * from './types/index.js'

export * from '#src/context/Request'
export * from '#src/context/Response'
export * from '#src/annotations/Controller'
export * from '#src/annotations/Middleware'
export * from '#src/annotations/Interceptor'
export * from '#src/annotations/Terminator'
export * from '#src/facades/Route'
export * from '#src/facades/Server'
export * from '#src/providers/HttpRouteProvider'
export * from '#src/providers/HttpServerProvider'
export * from '#src/kernels/HttpKernel'
export * from '#src/handlers/FastifyHandler'
export * from '#src/handlers/HttpExceptionHandler'
export * from '#src/router/Router'
export * from '#src/server/ServerImpl'
export * from '#src/exceptions/BadGatewayException'
export * from '#src/exceptions/BadRequestException'
export * from '#src/exceptions/ForbiddenException'
export * from '#src/exceptions/HttpException'
export * from '#src/exceptions/InternalServerException'
export * from '#src/exceptions/MethodNotAllowedException'
export * from '#src/exceptions/NotAcceptableException'
export * from '#src/exceptions/NotFoundException'
export * from '#src/exceptions/NotImplementedException'
export * from '#src/exceptions/PayloadTooLargeException'
export * from '#src/exceptions/RequestTimeoutException'
export * from '#src/exceptions/ServiceUnavailableException'
export * from '#src/exceptions/UnauthorizedException'
export * from '#src/exceptions/UnprocessableEntityException'
