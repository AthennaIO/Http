/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpKernel } from '#src/Kernels/HttpKernel'

export class Kernel extends HttpKernel {
  /**
   * The application's global HTTP middlewares.
   *
   * This middlewares are run during every request to your http server.
   */
  get globalMiddlewares() {
    return [import('./Controllers/TestMiddleware.js')]
  }

  /**
   * The application's named HTTP middlewares.
   *
   * Here you define all your named middlewares to use inside routes/http file.
   */
  get namedMiddlewares() {
    return {
      intercept: import('./Middlewares/InterceptMiddleware.js'),
    }
  }
}
