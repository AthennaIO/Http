import type { ZodError } from 'zod'
import { HttpException } from '#src/exceptions/HttpException'

export class ResponseValidationException extends HttpException {
  public constructor(error: ZodError) {
    const name = 'ResponseValidationException'
    const code = 'E_RESPONSE_VALIDATION_ERROR'
    const status = 500
    const message = 'The server failed to generate a valid response.'
    const details = error.issues

    super({ name, message, status, code, details })
  }
}
