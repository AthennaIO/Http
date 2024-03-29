/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Context } from '#src/types'
import { Controller } from '#src/annotations/Controller'

@Controller({ alias: 'decoratedController', type: 'singleton' })
export class AnnotatedController {
  async index(ctx: Context) {
    if (ctx.data.handled) {
      return ctx.response.send({ hello: 'world', handled: true })
    }

    await ctx.response.send({ hello: 'world' })
  }

  async store(ctx: Context) {
    if (ctx.data.handled) {
      return ctx.response.send({ hello: 'world', handled: true })
    }

    await ctx.response.send({ hello: 'world' })
  }

  async show(ctx: Context) {
    if (ctx.data.handled) {
      return ctx.response.send({ hello: 'world', handled: true })
    }

    await ctx.response.send({ hello: 'world' })
  }

  async update(ctx: Context) {
    if (ctx.data.handled) {
      return ctx.response.send({ hello: 'world', handled: true })
    }

    await ctx.response.send({ hello: 'world' })
  }

  async delete(ctx: Context) {
    if (ctx.data.handled) {
      return ctx.response.send({ hello: 'world', handled: true })
    }

    await ctx.response.send({ hello: 'world' })
  }

  async vanillaError() {
    throw new Error('error')
  }
}
