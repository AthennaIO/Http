import { MiddlewareContract } from '../Contracts/MiddlewareContract'

export type MiddlewareContractClass = {
  new (container?: any): MiddlewareContract
}

export abstract class HttpKernel {
  /**
   * The application's global HTTP middlewares.
   *
   * This middlewares are run during every request to your http server.
   */
  protected abstract globalMiddlewares: MiddlewareContractClass[]

  /**
   * The application's named HTTP middlewares.
   *
   * Here you define all your named middlewares to use inside routes/http file.
   */
  protected abstract namedMiddlewares: Record<string, MiddlewareContractClass>
}
