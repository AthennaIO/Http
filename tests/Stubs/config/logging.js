export default {
  /*
  |--------------------------------------------------------------------------
  | Default Log Channel
  |--------------------------------------------------------------------------
  |
  | This option defines the default log channel that gets used when writing
  | messages to the logs. The name specified in this option should match
  | one of the channels defined in the "channels" configuration object.
  |
  */

  default: 'application',

  /*
  |--------------------------------------------------------------------------
  | Log Channels
  |--------------------------------------------------------------------------
  |
  | Here you may configure the log channels for your application.
  |
  | Available Drivers:
  |   "console", "discord", "file", "null", "slack", "telegram".
  | Available Formatters:
  |   "cli", "simple", "json", "request", "message"".
  |
  */

  channels: {
    console: {
      driver: 'console',
      formatter: 'cli',
    },
    exception: {
      driver: 'console',
      formatter: 'none',
      streamType: 'stderr',
    },
    application: {
      driver: 'console',
      formatter: 'simple',
    },
    request: {
      driver: 'console',
      formatter: 'request',
      formatterConfig: {
        asJson: false,
      },
    },
  },
}
