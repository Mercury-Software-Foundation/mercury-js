import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { withNx } from '@nx/rollup/with-nx.js';

export default withNx(
  {
    main: './src/index.ts',
    outputPath: '../../dist/packages/core',
    tsConfig: './tsconfig.lib.json',
    compiler: 'tsc',
    format: ['cjs', 'esm'],
  },
  {
    // Additional rollup configuration here
    // Example: output: { sourcemap: true },
    strictRequires: true,
    plugins: [optimizeLodashImports(), commonjs(), typescript(), resolve()],
  }
);
