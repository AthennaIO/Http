/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export default {
  logger: true,
  cors: {
    origin: ['*'],
    methods: ['*'],
    allowedHeaders: ['*'],
    exposedHeaders: ['*'],
    maxAge: 0,
    credentials: false,
  },
  helmet: {
    global: true,
  },
  swagger: {
    ui: {
      staticCSP: true,
      routePrefix: '/documentation',
    },
    configurations: {
      mode: 'dynamic',
      swagger: {
        basePath: '/',
        title: 'Athenna',
        version: '3',
        description: 'Athenna http server documentation',
        externalDocs: {
          url: 'https://swagger.io',
          description: 'Find more info about Swagger here',
        },
      },
    },
  },
  rateLimit: {
    global: true,
    max: 1000,
    ban: null,
    timeWindow: 1000 * 60,
    cache: 5000,
    allowList: [],
    continueExceeding: false,
    enableDraftSpec: false,
  },
  rTracer: {
    echoHeader: false,
    useHeader: false,
    headerName: 'X-Request-Id',
    useFastifyRequestId: false,
  },
}
