import { Context } from '#src/Types/Contexts/Context'

export class HelloController {
  async index(ctx: Context) {
    await ctx.response.send({ hello: 'world' })
  }

  async store(ctx: Context) {
    await ctx.response.send({ hello: 'world' })
  }

  async show(ctx: Context) {
    await ctx.response.send({ hello: 'world' })
  }

  async update(ctx: Context) {
    await ctx.response.send({ hello: 'world' })
  }

  async delete(ctx: Context) {
    await ctx.response.send({ hello: 'world' })
  }
}
