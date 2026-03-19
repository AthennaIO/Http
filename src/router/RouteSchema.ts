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
  zod: RouteZodSchemas | null
} {
  const request: ZodRequestSchema = {}
  const response: ZodResponseSchema = {}
  const schema: FastifySchema = { ...options }

  const requestKeys = ['body', 'headers', 'params', 'querystring'] as const

  requestKeys.forEach(key => {
    if (!isZodSchema(options[key])) {
      return
    }

    request[key] = options[key]
    schema[key] = toJsonSchema(options[key], 'input')
  })

  if (options.response && Is.Object(options.response)) {
    schema.response = { ...options.response }

    Object.entries(options.response).forEach(([statusCode, value]) => {
      if (!isZodSchema(value)) {
        return
      }

      response[statusCode] = value
      schema.response[statusCode] = toJsonSchema(value, 'output')
    })
  }

  const hasZodSchemas =
    Object.keys(request).length > 0 || Object.keys(response).length > 0

  return {
    schema,
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
    req.params = await parseSchema(
      requestSchemas.params,
      coerceDataForValidation(requestSchemas.params, req.params)
    )
  }

  if (requestSchemas.querystring) {
    req.query = await parseSchema(
      requestSchemas.querystring,
      coerceDataForValidation(requestSchemas.querystring, req.query)
    )
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

  return parseSchema(schema, payload)
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
  const jsonSchemaMethod =
    (schema as any)['~standard']?.jsonSchema?.[io] ||
    (schema as any).toJSONSchema

  if (!jsonSchemaMethod) {
    return {}
  }

  const jsonSchema = jsonSchemaMethod({
    target: 'draft-07',
    libraryOptions: { unrepresentable: 'any' }
  })

  delete jsonSchema.$schema

  return jsonSchema
}

function coerceDataForValidation(schema: ZodAny, data: any) {
  return coerceDataByJsonSchema(toJsonSchema(schema, 'input'), data)
}

function coerceDataByJsonSchema(schema: any, data: any): any {
  if (Is.Undefined(data) || Is.Null(data) || !schema) {
    return data
  }

  if (schema.anyOf) {
    return coerceWithAlternatives(schema.anyOf, data)
  }

  if (schema.oneOf) {
    return coerceWithAlternatives(schema.oneOf, data)
  }

  if (schema.type === 'object' && Is.Object(data)) {
    const coerced = { ...data }
    const properties = schema.properties || {}

    Object.entries(properties).forEach(([key, childSchema]) => {
      if (!Object.hasOwn(coerced, key)) {
        return
      }

      coerced[key] = coerceDataByJsonSchema(childSchema, coerced[key])
    })

    return coerced
  }

  if (schema.type === 'array' && Is.Array(data) && schema.items) {
    return data.map(item => coerceDataByJsonSchema(schema.items, item))
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    return coerceNumber(data, schema.type === 'integer')
  }

  return data
}

function coerceWithAlternatives(schemas: any[], data: any) {
  let coerced = data

  schemas.forEach(schema => {
    coerced = coerceDataByJsonSchema(schema, coerced)
  })

  return coerced
}

function coerceNumber(value: any, integerOnly: boolean) {
  if (!Is.String(value) || value.trim() === '') {
    return value
  }

  const parsed = integerOnly ? Number.parseInt(value, 10) : Number(value)

  if (Number.isNaN(parsed)) {
    return value
  }

  if (integerOnly && !Number.isInteger(parsed)) {
    return value
  }

  return parsed
}

function isZodSchema(value: any): value is ZodAny {
  return (
    Is.Defined(value) &&
    Is.Function(value.parse) &&
    Is.Function(value.safeParseAsync)
  )
}
