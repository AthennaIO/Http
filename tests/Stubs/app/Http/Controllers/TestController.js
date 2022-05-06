/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class TestController {
  /**
   * Index method.
   *
   * @param {import('#src/index').ContextContract} ctx
   * @return {Promise<void>}
   */
  async index({ data, request, response }) {
    const body = { hello: 'world' }

    if (data.midHandler) body.midHandler = data.midHandler
    if (data.rscHandler) body.rscHandler = data.rscHandler
    if (data.middlewares) body.middlewares = data.middlewares
    if (data.patchHandler) body.patchHandler = data.patchHandler
    if (request.queries.test) body.test = request.query('test')
    if (request.queries.throwError) throw new Exception('Testing', 400)

    return response.status(200).send(body)
  }

  /**
   * Show method.
   *
   * @param {import('#src/index').ContextContract} ctx
   * @return {Promise<void>}
   */
  async show({ data, request, response }) {
    const body = { hello: 'world' }

    if (data.midHandler) body.midHandler = data.midHandler
    if (data.rscHandler) body.rscHandler = data.rscHandler
    if (data.middlewares) body.middlewares = data.middlewares
    if (data.patchHandler) body.patchHandler = data.patchHandler
    if (request.queries.test) body.test = request.query('test')
    if (request.queries.throwError) throw new Exception('Testing', 400)

    return response.status(200).send(body)
  }

  /**
   * Store method.
   *
   * @param {import('#src/index').ContextContract} ctx
   * @return {Promise<void>}
   */
  async store({ data, request, response }) {
    const body = { hello: 'world' }

    if (data.midHandler) body.midHandler = data.midHandler
    if (data.rscHandler) body.rscHandler = data.rscHandler
    if (data.middlewares) body.middlewares = data.middlewares
    if (data.patchHandler) body.patchHandler = data.patchHandler
    if (request.queries.test) body.test = request.query('test')
    if (request.queries.throwError) throw new Exception('Testing', 400)

    return response.status(200).send(body)
  }
}
