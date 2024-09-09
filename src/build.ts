import { build } from 'unbuild'
import type { BuildConfig } from 'unbuild'

interface Options {
  plugins: {
    input: `${string}.ts`
    outDir: string
  }[]
}

/**
 * Build CkEditor plugins using unbuild
 */
export function buildCkEditorPlugins(args: Options): void {
  // build files using unbuild
  (async () => {
    for await (const plugin of args.plugins) {
      const config: BuildConfig = {
        entries: [{
          builder: 'rollup',
          input: plugin.input,
        }],
        externals: [
          '@ckeditor/ckeditor5-core',
          '@ckeditor/ckeditor5-engine',
          '@ckeditor/ckeditor5-typing',
          '@ckeditor/ckeditor5-ui',
          '@ckeditor/ckeditor5-utils',
        ],
        rollup: {
          inlineDependencies: true,
          output: {
            dir: plugin.outDir,
          },
        },
        clean: false,
      }

      await build('.', false, config)
    }
  })()
}
