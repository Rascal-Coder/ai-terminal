import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import del from 'rollup-plugin-delete';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: ['src/index.ts', 'src/startOllamaServe.ts'],
  output: {
    dir: 'dist', // 输出目录
    format: 'esm',
    sourcemap: !production,
  },
  plugins: [
    production && del({ targets: 'dist/*' }),
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    json(),
    terser(),
  ],
  external: ['child_process', 'os', 'util', '@clack/prompts', 'ora', 'chalk', 'cherrio', 'ollama'],
};
