const { withNx } = require('@nx/rollup/with-nx');

module.exports = withNx(
  {
    main: './src/index.ts',
    outputPath: '../../../dist/packages/plugins/redis',
    tsConfig: './tsconfig.lib.json',
    compiler: 'tsc',
    format: ['cjs', 'esm'],
    assets: [{ input: '.', output: '.', glob: '*.md' }],
  },
  {
    // Provide additional rollup configuration here. See: https://rollupjs.org/configuration-options
    // e.g.
    // output: { sourcemap: true },
  }
);
