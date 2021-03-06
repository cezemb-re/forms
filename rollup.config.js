import path from 'path';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import autoprefixer from 'autoprefixer';
import pkg from './package.json';

const { dependencies = {}, peerDependencies = {} } = pkg;

const externals = [...Object.keys(dependencies), ...Object.keys(peerDependencies)];

export default [
  {
    input: path.resolve(__dirname, 'src/index.ts'),
    external: (id) => externals.some((dep) => id === dep || id.startsWith(`${dep}/`)),
    plugins: [
      typescript(),
      commonjs(),
      json(),
      resolve({ browser: true }),
      babel({
        extensions: ['.ts', '.js', '.tsx', '.jsx'],
      }),
      postcss({
        plugins: [autoprefixer],
      }),
    ],
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
      { name: pkg.name, file: pkg.module, format: 'es' },
      {
        name: pkg.name,
        file: pkg.browser,
        format: 'umd',
        globals: {
          react: 'React',
        },
      },
      {
        name: pkg.name,
        file: pkg['browser:min'],
        format: 'umd',
        globals: {
          react: 'React',
        },
        plugins: [terser()],
      },
    ],
  },
];
