// const { withNx } = require('@nx/rollup/with-nx');
import { withNx } from '@nx/rollup/with-nx.js';

export default withNx(
  {
    main: './src/index.ts',
    outputPath: '../../../dist/packages/plugins/historyTracking',
    tsConfig: './tsconfig.lib.json',
    compiler: 'tsc',
    format: ['cjs', 'esm'],
    assets: [{ input: '.', output: '.', glob: '*.md' }],
    plugins: []
  },
  {
    // Provide additional rollup configuration here. See: https://rollupjs.org/configuration-options
    // e.g.
    // output: { sourcemap: true },
  }
);
