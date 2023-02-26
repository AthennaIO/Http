/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

import { Server } from '#src'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Config } from '@athenna/config'
import { Is, Module } from '@athenna/common'

export class HttpKernel {
  /**
   * Register all the controllers found inside "rc.controllers" config
   * inside the service provider.
   */
  public async registerControllers() {
    const controllers = Config.get<string[]>('rc.controllers', [])

    const promises = controllers.map(path =>
      this.resolvePathAndImport(path).then(Controller => {
        if (Reflect.hasMetadata('provider:registered', Controller)) {
          return
        }

        const createCamelAlias = false
        const alias = `App/Http/Controllers/${Controller.name}`

        ioc.bind(alias, Controller, createCamelAlias)
      }),
    )

    await Promise.all(promises)
  }

  /**
   * Register all the middlewares found inside "rc.middlewares" config
   * inside the service provider. Also register if "rc.namedMiddlewares"
   * and "rc.globalMiddlewares" exists.
   */
  public async registerMiddlewares() {
    await this.registerNamedMiddlewares()
    await this.registerGlobalMiddlewares()

    if (Config.exists('rc.middlewares')) {
      await Promise.all(
        Config.get<string[]>('rc.middlewares').map(this.resolvePathAndImport),
      )
    }
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

    const promises = Object.keys(namedMiddlewares).map(key =>
      this.resolvePathAndImport(namedMiddlewares[key]).then(Middleware => {
        if (Reflect.hasMetadata('provider:registered', Middleware)) {
          return
        }

        const createCamelAlias = false
        const { alias, namedAlias } = this.getNamedMiddlewareAlias(
          key,
          Middleware,
        )

        ioc.bind(alias, Middleware, createCamelAlias).alias(namedAlias, alias)
      }),
    )

    await Promise.all(promises)
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

    const promises = globalMiddlewares.map(path =>
      this.resolvePathAndImport(path).then(Middleware => {
        if (Reflect.hasMetadata('provider:registered', Middleware)) {
          return
        }

        const createCamelAlias = false
        const { alias, handler, serverMethod } =
          this.getGlobalMiddlewareAliasAndHandler(Middleware)

        ioc.bind(alias, Middleware, createCamelAlias)

        Server[serverMethod](ioc.safeUse(alias)[handler])
      }),
    )

    await Promise.all(promises)
  }

  /**
   * Fabricate the named middlewares aliases.
   */
  private getNamedMiddlewareAlias(name: string, Middleware: any) {
    const middleware = new Middleware()

    if (middleware.handle) {
      return {
        alias: `App/Http/Middlewares/${Middleware.name}`,
        namedAlias: `App/Http/Middlewares/Names/${name}`,
      }
    }

    if (middleware.intercept) {
      return {
        alias: `App/Http/Interceptors/${Middleware.name}`,
        namedAlias: `App/Http/Interceptors/Names/${name}`,
      }
    }

    if (middleware.terminate) {
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
    const middleware = new Middleware()

    if (middleware.handle) {
      return {
        handler: 'handle',
        serverMethod: 'middleware',
        alias: `App/Http/Middlewares/${Middleware.name}`,
      }
    }

    if (middleware.intercept) {
      return {
        handler: 'intercept',
        serverMethod: 'intercept',
        alias: `App/Http/Interceptors/${Middleware.name}`,
      }
    }

    if (middleware.terminate) {
      return {
        handler: 'terminate',
        serverMethod: 'terminate',
        alias: `App/Http/Terminators/${Middleware.name}`,
      }
    }
  }

  /**
   * Resolve the import path by meta URL and import it.
   */
  private resolvePathAndImport(path: string) {
    if (path.includes('./') || path.includes('../')) {
      path = resolve(path)
    }

    if (!path.startsWith('#')) {
      path = pathToFileURL(path).href
    }

    return import.meta
      .resolve(path, Config.get('rc.meta'))
      .then(meta => Module.get(import(`${meta}?version=${Math.random()}`)))
  }
}
