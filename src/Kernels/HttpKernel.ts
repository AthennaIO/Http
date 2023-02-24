/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Server } from '#src'
import { Is } from '@athenna/common'

export class HttpKernel {
  /**
   * Register all the middlewares found inside "rc.middlewares" config
   * inside the service provider. Also register if "rc.namedMiddlewares"
   * and "rc.globalMiddlewares" exists.
   */
  public async registerMiddlewares() {
    const paths = Config.get<string[]>('rc.middlewares')

    await Promise.all(paths.map(path => import(path)))

    await this.registerNamedMiddlewares()
    await this.registerGlobalMiddlewares()
  }

  /**
   * Register all the named middlewares found inside "rc.namedMiddlewares"
   * property.
   */
  public async registerNamedMiddlewares() {
    const namedMiddlewares = Config.get<Record<string, string>>(
      'rc.namedMiddlewares',
    )

    if (Is.Empty(namedMiddlewares)) {
      return
    }

    return Object.keys(namedMiddlewares).map(key => {
      return import.meta
        .resolve(namedMiddlewares[key], Config.get('rc.meta'))
        .then(importMetaPath =>
          import(importMetaPath).then(Middleware => {
            const createCamelAlias = false
            const { alias, namedAlias } = this.getNamedMiddlewareAlias(
              key,
              Middleware,
            )

            ioc
              .bind(alias, Middleware, createCamelAlias)
              .alias(namedAlias, alias)
          }),
        )
    })
  }

  /**
   * Register all the named middlewares found inside "rc.globalMiddlewares"
   * property.
   */
  public async registerGlobalMiddlewares() {
    const globalMiddlewares = Config.get<string[]>('rc.globalMiddlewares')

    if (Is.Empty(globalMiddlewares)) {
      return
    }

    return globalMiddlewares.map(path => {
      return import.meta
        .resolve(path, Config.get('rc.meta'))
        .then(Middleware => {
          const createCamelAlias = false

          const { alias, handler, serverMethod } =
            this.getGlobalMiddlewareAliasAndHandler(Middleware)

          ioc.bind(alias, Middleware, createCamelAlias)

          Server[serverMethod](ioc.safeUse(alias)[handler])
        })
    })
  }

  /**
   * Fabricate the named middlewares aliases.
   */
  private getNamedMiddlewareAlias(name: string, Middleware: any) {
    if (Middleware.handle) {
      return {
        alias: `App/Http/Middlewares/${Middleware.name}`,
        namedAlias: `App/Http/Middlewares/Names/${name}`,
      }
    }

    if (Middleware.intercept) {
      return {
        alias: `App/Http/Interceptors/${Middleware.name}`,
        namedAlias: `App/Http/Interceptors/Names/${name}`,
      }
    }

    if (Middleware.terminate) {
      return {
        alias: `App/Http/Terminators/${Middleware.name}`,
        namedAlias: `App/Http/Terminators/Names/${name}`,
      }
    }
  }

  /**
   * Fabricate the global middlewares alias and resolve the handler and
   * server methods.
   */
  private getGlobalMiddlewareAliasAndHandler(Middleware: any) {
    if (Middleware.handle) {
      return {
        handler: 'handle',
        serverMethod: 'middleware',
        alias: `App/Http/Middlewares/${Middleware.name}`,
      }
    }

    if (Middleware.intercept) {
      return {
        handler: 'intercept',
        serverMethod: 'intercept',
        alias: `App/Http/Interceptors/${Middleware.name}`,
      }
    }

    if (Middleware.terminate) {
      return {
        handler: 'terminate',
        serverMethod: 'terminate',
        alias: `App/Http/Terminators/${Middleware.name}`,
      }
    }
  }
}
