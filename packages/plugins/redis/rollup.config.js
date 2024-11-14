import { withNx } from '@nx/rollup/with-nx.js';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default withNx(
  {
    main: './src/index.ts',
    outputPath: '../../../dist/packages/plugins/redis',
    tsConfig: './tsconfig.lib.json',
    compiler: 'tsc',
    format: ['cjs', 'esm'],
    assets: [{ input: '.', output: '.', glob: '*.md' }],
  },
  {
    output: {
      exports: 'named',
      interop: 'auto',
    },
    external: ['redis'],
    strictRequires: true,
    plugins: [
      commonjs(), 
      typescript(), 
      resolve()
    ],
  }
);