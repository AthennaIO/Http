import { Context } from '#src/Types/Contexts/Context'

export class HelloController {
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
