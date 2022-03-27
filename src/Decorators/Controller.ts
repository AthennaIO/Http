/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'
import { removeSlash } from '../Utils/removeSlash'
import { Is } from '@secjs/utils'

export function Controller(path?: string | string[]): ClassDecorator {
  if (!path) path = '/'

  path = removeSlash(path)

  return (target: any) => {
    const routes: any[] = Reflect.getMetadata('controller:routes', target)

    if (routes && routes.length) {
      if (Array.isArray(path)) {
        const routesPrefixed = []

        path.forEach(p => {
          if (p === '/') return

          routes.forEach(route =>
            routesPrefixed.push({
              ...route,
              path: `${p}${route.path}`,
            }),
          )
        })

        Reflect.defineMetadata('controller:routes', routesPrefixed, target)
      } else {
        const routesPrefixed =
          path === '/'
            ? routes
            : routes.filter(route => (route.path = `${path}${route.path}`))

        Reflect.defineMetadata('controller:routes', routesPrefixed, target)
      }
    }

    Reflect.defineMetadata(
      'controller:path',
      Is.String(path) ? [path] : path,
      target,
    )
  }
}
