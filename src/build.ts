import { build } from 'unbuild'
import type { BuildConfig } from 'unbuild'

interface Options {
  plugins: {
    input: `${string}.ts`
    outDir: string
  }[]
}

export function buildCkEditorPlugins(args: Options): void {
  const config: BuildConfig = {
    entries: args.plugins.map(plugin => ({
      builder: 'rollup',
      input: plugin.input,
      outDir: plugin.outDir,
    })),
    externals: [
      '@ckeditor/ckeditor5-core',
      '@ckeditor/ckeditor5-engine',
      '@ckeditor/ckeditor5-typing',
      '@ckeditor/ckeditor5-ui',
      '@ckeditor/ckeditor5-utils',
    ],
    rollup: {
      inlineDependencies: true,
    },
  };

  // build files using unbuild
  (async () => {
    await build('.', false, config)
  })()
}
