// const { withNx } = require('@nx/rollup/with-nx');
import { withNx } from '@nx/rollup/with-nx.js';
import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default withNx(
  {
    main: './src/index.ts',
    outputPath: '../../../dist/packages/plugins/historyTracking',
    tsConfig: './tsconfig.lib.json',
    compiler: 'tsc',
    format: ['cjs', 'esm'],
    assets: [{ input: '.', output: '.', glob: '*.md' }],
  },
  {
    // Provide additional rollup configuration here. See: https://rollupjs.org/configuration-options
    // e.g.
    // output: { sourcemap: true },
    // external: ['mongoose', 'lodash'],
    output: {
      exports: 'named',
      interop: 'auto'
    },
    strictRequires: true,
    plugins: [optimizeLodashImports(), commonjs(), typescript(), resolve()],
  }
);
