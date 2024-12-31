/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File, Path } from '@athenna/common'
import type { Manifest, ModuleNode } from 'vite'

const styleFileRegex = /\.(css|less|sass|scss|styl|stylus|pcss|postcss)($|\?)/

export class Vite {
  /**
   * We cache the manifest file content in production
   * to avoid reading the file multiple times.
   */
  public manifestCache?: Manifest

  /**
   * Verify if vite is running in development mode.
   */
  public get isViteRunning() {
    return process.argv.includes('--vite')
  }

  /**
   * Reads the file contents as JSON.
   */
  public readFileAsJSON(filePath: string) {
    return new File(filePath).getContentAsJsonSync()
  }

  /**
   * Returns a new array with unique items by the given key
   */
  public uniqueBy<T>(array: T[], key: keyof T): T[] {
    const seen = new Set()

    return array.filter(item => {
      const k = item[key]
      return seen.has(k) ? false : seen.add(k)
    })
  }

  /**
   * Convert Record of attributes to a valid HTML string.
   */
  public makeAttributes(attributes: Record<string, string | boolean>) {
    return Object.keys(attributes)
      .map(key => {
        const value = attributes[key]

        if (value === true) {
          return key
        }

        if (!value) {
          return null
        }

        return `${key}="${value}"`
      })
      .filter(attr => attr !== null)
      .join(' ')
  }

  /**
   * Generates a JSON element with a custom toString implementation.
   */
  public generateElement(element: any) {
    const makeAttributes = this.makeAttributes

    return {
      ...element,
      toString() {
        const attributes = `${makeAttributes(element.attributes)}`
        if (element.tag === 'link') {
          return `<${element.tag} ${attributes}/>`
        }

        return `<${element.tag} ${attributes}>${element.children.join('\n')}</${
          element.tag
        }>`
      }
    }
  }

  /**
   * Returns the script needed for the HMR working with Vite.
   */
  public getViteHmrScript() {
    return this.generateElement({
      tag: 'script',
      attributes: {
        type: 'module',
        src: '/@vite/client'
      },
      children: []
    })
  }

  /**
   * Check if the given path is a CSS path.
   */
  public isCssPath(path: string) {
    return path.match(styleFileRegex) !== null
  }

  /**
   * If the module is a style module.
   */
  public isStyleModule(mod: ModuleNode) {
    if (
      this.isCssPath(mod.url) ||
      (mod.id && /\?vue&type=style/.test(mod.id))
    ) {
      return true
    }

    return false
  }

  /**
   * Create a style tag for the given path
   */
  public makeStyleTag(url: string, attributes?: any) {
    return this.generateElement({
      tag: 'link',
      attributes: { rel: 'stylesheet', href: url, ...attributes }
    })
  }

  /**
   * Create a script tag for the given path
   */
  public makeScriptTag(url: string, attributes?: any) {
    return this.generateElement({
      tag: 'script',
      attributes: { type: 'module', src: url, ...attributes },
      children: []
    })
  }

  /**
   * Generate a HTML tag for the given asset
   */
  public generateTag(asset: string, attributes?: any) {
    let url = ''

    if (this.isViteRunning) {
      url = `/${asset}`
    } else {
      url = asset
    }

    if (this.isCssPath(asset)) {
      return this.makeStyleTag(url, attributes)
    }

    return this.makeScriptTag(url, attributes)
  }

  /**
   * Get a chunk from the manifest file for a given file name
   */
  public chunk(manifest: Manifest, entrypoint: string) {
    const chunk = manifest[entrypoint]

    if (!chunk) {
      throw new Error(`Cannot find "${entrypoint}" chunk in the manifest file`)
    }

    return chunk
  }

  /**
   * Get a list of chunks for a given filename
   */
  public chunksByFile(manifest: Manifest, file: string) {
    return Object.entries(manifest)
      .filter(([, chunk]) => chunk.file === file)
      .map(([_, chunk]) => chunk)
  }

  /**
   * Generate preload tag for a given url
   */
  public makePreloadTagForUrl(url: string) {
    const attributes = this.isCssPath(url)
      ? { rel: 'preload', as: 'style', href: url }
      : { rel: 'modulepreload', href: url }

    return this.generateElement({ tag: 'link', attributes })
  }

  /**
   * Generate style and script tags for the given entrypoints
   * Also adds the @vite/client script
   */
  public async generateEntryPointsTagsForDevMode(
    entryPoints: string[],
    attributes?: any
  ) {
    const tags = entryPoints.map(entrypoint =>
      this.generateTag(entrypoint, attributes)
    )

    const viteHmr = this.getViteHmrScript()
    const result = [viteHmr, tags]

    return result.sort(tag => (tag.tag === 'link' ? -1 : 1))
  }

  /**
   * Generate style and script tags for the given entrypoints
   * using the manifest file
   */
  public generateEntryPointsTagsWithManifest(
    entryPoints: string[],
    attributes?: any
  ) {
    const manifest = this.manifest()
    const tags: { path: string; tag: any }[] = []
    const preloads: Array<{ path: string }> = []

    for (const entryPoint of entryPoints) {
      const chunk = this.chunk(manifest, entryPoint)
      preloads.push({ path: chunk.file })
      tags.push({
        path: chunk.file,
        tag: this.generateTag(chunk.file, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          integrity: chunk.integrity
        })
      })

      for (const css of chunk.css || []) {
        preloads.push({ path: css })
        tags.push({ path: css, tag: this.generateTag(css) })
      }

      for (const importNode of chunk.imports || []) {
        preloads.push({ path: manifest[importNode].file })

        for (const css of manifest[importNode].css || []) {
          const subChunk = this.chunksByFile(manifest, css)

          preloads.push({ path: css })
          tags.push({
            path: css,
            tag: this.generateTag(css, {
              ...attributes,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              integrity: subChunk[0]?.integrity
            })
          })
        }
      }
    }

    const preloadsElements = this.uniqueBy(preloads, 'path')
      .sort(preload => (this.isCssPath(preload.path) ? -1 : 1))
      .map(preload => this.makePreloadTagForUrl(preload.path))

    return preloadsElements.concat(tags.map(({ tag }) => tag))
  }

  /**
   * Generate tags for the entry points
   */
  public async generateEntryPointsTags(
    entryPoints: string[] | string,
    attributes?: any
  ) {
    entryPoints = Array.isArray(entryPoints) ? entryPoints : [entryPoints]

    if (this.isViteRunning) {
      return this.generateEntryPointsTagsForDevMode(entryPoints, attributes)
    }

    return this.generateEntryPointsTagsWithManifest(entryPoints, attributes)
  }

  /**
   * Returns the manifest file contents
   *
   * @throws Will throw an exception when running in dev
   */
  public manifest(): Manifest {
    if (this.isViteRunning) {
      throw new Error('Cannot read the manifest file when running in dev mode')
    }

    if (!this.manifestCache) {
      this.manifestCache = this.readFileAsJSON(
        Path.public('assets/.vite/manifest.json')
      )
    }

    return this.manifestCache!
  }
}
