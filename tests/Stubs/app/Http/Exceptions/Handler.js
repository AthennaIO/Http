import { HttpExceptionHandler } from '#src/Handlers/HttpExceptionHandler'

/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| Athenna will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
*/

export class Handler extends HttpExceptionHandler {
  /**
   * The global exception handler of all HTTP requests.
   *
   * @param ctx
   */
  async handle(ctx) {
    return super.handle(ctx)
  }
}
