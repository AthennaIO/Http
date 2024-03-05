/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is, Json } from '@athenna/common'
import type { AddressInfo } from 'node:net'
import type { FastifyRequest } from 'fastify'

export function request(req: FastifyRequest) {
  const request = {
    request: req,
    id: req.id,
    ip: req.ip,
    hostname: req.hostname,
    get port() {
      return request.getAddressInfo().port
    },
    version: req.raw.httpVersion,
    protocol: req.protocol,
    method: req.method,
    baseUrl: req.url.split('?')[0],
    get baseHostUrl() {
      return request.getHostUrlFor(request.baseUrl)
    },
    routeUrl: req.routeOptions.url,
    get routeHostUrl() {
      return request.getHostUrlFor(request.routeUrl)
    },
    originalUrl: req.url,
    get originalHostUrl() {
      return request.getHostUrlFor(request.originalUrl)
    },
    body: req.body || {},
    params: req.params || {},
    queries: req.query || {},
    headers: req.headers || {},
    param(param: string, defaultValue?: any) {
      return Json.get(request.params, param, defaultValue)
    },
    query(query: string, defaultValue?: any) {
      return Json.get(request.queries, query, defaultValue)
    },
    header(header: string, defaultValue?: any) {
      return Json.get(request.headers, header, defaultValue)
    },
    input(key: string, defaultValue?: any) {
      return request.payload(key, defaultValue)
    },
    payload(key: string, defaultValue?: any) {
      return Json.get(request.body, key, defaultValue)
    },
    only(keys: string[]) {
      const body = {}

      Object.keys(request.body).forEach(key => {
        if (!keys.includes(key)) {
          return
        }

        body[key] = request.body[key]
      })

      return body
    },
    except(keys: string[]) {
      const body = {}

      Object.keys(request.body).forEach(key => {
        if (keys.includes(key)) {
          return
        }

        body[key] = request.body[key]
      })

      return body
    },
    getHostUrlFor(url: string) {
      let { address, port } = request.getAddressInfo()

      if (address === '::1') {
        address = '127.0.0.1'
      }

      if (!Is.Ip(address) && address !== 'localhost') {
        return `${request.protocol}://${address}${url}`
      }

      return `${request.protocol}://${address}:${port}${url}`
    },
    getAddressInfo() {
      return req.server.server.address() as AddressInfo
    }
  }

  return request
}
