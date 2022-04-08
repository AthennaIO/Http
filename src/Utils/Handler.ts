/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class Handler {
  private readonly alias: any

  public constructor(alias: any) {
    this.alias = alias
  }

  get(_object: any, key: string) {
    const provider = ioc.use(this.alias)

    if (!provider) {
      return () => {}
    }

    return provider[key]
  }
}
