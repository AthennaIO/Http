import PluginRestart from 'vite-plugin-restart'

import { Path } from '@athenna/common'
import { mergeConfig, defineConfig, type UserConfig } from 'vite'

export function defineAthennaConfig(config: UserConfig) {
  const defaultConfig = {
    root: Path.pwd(),
    assetsUrl: '/assets',
    buildDirectory: 'public/assets',
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern'
        }
      }
    },
    build: {
      assetsDir: '',
      manifest: true,
      emptyOutDir: true,
      outDir: 'public/assets',
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        },
        input: [Path.resources('css/app.scss'), Path.resources('js/app.js')]
      }
    },
    plugins: [PluginRestart({ reload: [Path.views('**/*.edge')] })]
  }

  return defineConfig(mergeConfig(defaultConfig, config))
}
