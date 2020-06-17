import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import external from 'rollup-plugin-peer-deps-external';
import sass from 'rollup-plugin-sass';
import postcss from 'rollup-plugin-postcss';
import url from 'rollup-plugin-url';
import svgr from '@svgr/rollup';
import dts from 'rollup-plugin-dts';
import typescript from 'rollup-plugin-typescript2';
// postCSS plugins

import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';

import pkg from './package.json';

export default [
  {
    input: 'src/index.tsx',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      external(),
      postcss({
        plugins: [simplevars(), nested()],
        modules: true
      }),
      resolve(),
      typescript({
        rollupCommonJSResolveHack: true,
        importHelpers: true,
        clean: true
      }),
      sass({
        insert: true
      }),
      url(),
      svgr(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      }),
      commonjs()
    ]
  },
  {
    input: 'src/AppointmentPicker/AppointmentPicker.tsx',
    output: [
      {
        file: './temp/index.es.js',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      external(),
      typescript({
        rollupCommonJSResolveHack: true,
        importHelpers: true,
        clean: true
      })
    ]
  },
  {
    // TypeScript Type Definitions
    input: 'temp/AppointmentPicker.d.ts',
    plugins: [dts()],
    output: { file: 'dist/index.d.ts', format: 'esm' }
  }
];
