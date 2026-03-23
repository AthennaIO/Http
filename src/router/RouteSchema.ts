/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ZodAny } from 'zod'
import { Is } from '@athenna/common'
import type { FastifyReply, FastifyRequest, FastifySchema } from 'fastify'
import { ZodValidationException } from '#src/exceptions/ZodValidationException'

type ZodRequestSchema = Partial<
  Record<'body' | 'headers' | 'params' | 'querystring', ZodAny>
>

type ZodResponseSchema = Record<number | string, ZodAny>

export type RouteSchemaOptions = FastifySchema & {
  body?: FastifySchema['body'] | ZodAny
  headers?: FastifySchema['headers'] | ZodAny
  params?: FastifySchema['params'] | ZodAny
  querystring?: FastifySchema['querystring'] | ZodAny
  response?: FastifySchema['response'] | ZodResponseSchema
}

export type RouteZodSchemas = {
  request: ZodRequestSchema
  response: ZodResponseSchema
}

export function normalizeRouteSchema(options: RouteSchemaOptions): {
  schema: FastifySchema
  swaggerSchema: FastifySchema
  zod: RouteZodSchemas | null
} {
  const request: ZodRequestSchema = {}
  const response: ZodResponseSchema = {}
  const schema: FastifySchema = { ...options }
  const swaggerSchema: FastifySchema = { ...options }

  const requestKeys = ['body', 'headers', 'params', 'querystring'] as const

  requestKeys.forEach(key => {
    if (!isZodSchema(options[key])) {
      return
    }

    request[key] = options[key]
    schema[key] = toJsonSchema(options[key], 'input')
    swaggerSchema[key] = toJsonSchema(options[key], 'input')
  })

  if (options.response && Is.Object(options.response)) {
    schema.response = { ...options.response }
    swaggerSchema.response = { ...options.response }

    Object.entries(options.response).forEach(([statusCode, value]) => {
      if (!isZodSchema(value)) {
        return
      }

      response[statusCode] = value
      swaggerSchema.response[statusCode] = toJsonSchema(value, 'output')
      delete schema.response[statusCode]
    })

    if (!Object.keys(schema.response).length) {
      delete schema.response
    }
  }

  const hasZodSchemas =
    Object.keys(request).length > 0 || Object.keys(response).length > 0

  return {
    schema,
    swaggerSchema,
    zod: hasZodSchemas ? { request, response } : null
  }
}

export async function parseRequestWithZod(
  req: FastifyRequest,
  schemas: RouteZodSchemas
) {
  const requestSchemas = schemas.request

  if (requestSchemas.body) {
    req.body = await parseSchema(requestSchemas.body, req.body)
  }

  if (requestSchemas.headers) {
    req.headers = await parseSchema(requestSchemas.headers, req.headers)
  }

  if (requestSchemas.params) {
    req.params = await parseSchema(requestSchemas.params, req.params)
  }

  if (requestSchemas.querystring) {
    req.query = await parseSchema(requestSchemas.querystring, req.query)
  }
}

export async function parseResponseWithZod(
  reply: FastifyReply,
  payload: any,
  schemas: RouteZodSchemas
) {
  const schema = getResponseSchema(reply.statusCode, schemas.response)

  if (!schema) {
    return payload
  }

  const result = await schema.safeParseAsync(payload)

  return result.success ? result.data : payload
}

function getResponseSchema(
  statusCode: number,
  schemas: ZodResponseSchema
): ZodAny | null {
  return (
    schemas[statusCode] ||
    schemas[String(statusCode)] ||
    schemas[`${String(statusCode)[0]}xx`] ||
    schemas.default ||
    null
  )
}

async function parseSchema(schema: ZodAny, data: any) {
  const result = await schema.safeParseAsync(data)

  if (!result.success) {
    throw new ZodValidationException(result.error)
  }

  return result.data
}

function toJsonSchema(schema: ZodAny, io: 'input' | 'output') {
  const standardJsonSchemaMethod = (schema as any)['~standard']?.jsonSchema?.[
    io
  ]

  if (standardJsonSchemaMethod) {
    const jsonSchema = standardJsonSchemaMethod({
      target: 'draft-07',
      libraryOptions: { unrepresentable: 'any' }
    })

    delete jsonSchema.$schema

    return jsonSchema
  }

  const jsonSchemaMethod = (schema as any).toJSONSchema

  if (!jsonSchemaMethod) {
    return {}
  }

  const jsonSchema = jsonSchemaMethod({
    io,
    target: 'draft-07',
    unrepresentable: 'any'
  })

  delete jsonSchema.$schema

  return jsonSchema
}

function isZodSchema(value: any): value is ZodAny {
  return (
    Is.Defined(value) &&
    Is.Function(value.parse) &&
    Is.Function(value.safeParseAsync)
  )
}
