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
    const { build } = await import('unbuild')

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
    }

    await build('.', false, config)
  })()
}
