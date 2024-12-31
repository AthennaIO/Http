/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import type { ConfigEnv, Plugin, UserConfig } from 'vite'
import type { PluginOptions } from '#src/types/vite/PluginOptions'

/**
 * Resolve the `config.base` value
 */
export function resolveBase(
  config: UserConfig,
  options: Required<PluginOptions>,
  command: 'build' | 'serve'
): string {
  if (config.base) return config.base
  if (command === 'build') {
    return options.assetsUrl.endsWith('/')
      ? options.assetsUrl
      : options.assetsUrl + '/'
  }

  return '/'
}

/**
 * Vite config hook
 */
export function configHook(
  options: Required<PluginOptions>,
  userConfig: UserConfig,
  { command }: ConfigEnv
): UserConfig {
  const config: UserConfig = {
    publicDir: userConfig.publicDir ?? false,
    base: resolveBase(userConfig, options, command),

    /**
     * Disable the vite dev server cors handling. Otherwise, it will
     * override the cors settings defined by @fastify/cors.
     */
    server: { cors: userConfig.server?.cors ?? false },

    build: {
      assetsDir: '',
      emptyOutDir: true,
      manifest: userConfig.build?.manifest ?? true,
      outDir: userConfig.build?.outDir ?? options.buildDirectory,
      assetsInlineLimit: userConfig.build?.assetsInlineLimit ?? 0,

      rollupOptions: {
        input: options.entrypoints.map(entrypoint =>
          join(userConfig.root || '', entrypoint)
        )
      }
    }
  }

  return config
}

/**
 * Update the user vite config to match Athenna requirements.
 */
export const config = (options: Required<PluginOptions>): Plugin => {
  return {
    name: 'vite-plugin-athenna:config',
    enforce: 'post',
    config: configHook.bind(null, options)
  }
}
