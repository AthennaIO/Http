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
