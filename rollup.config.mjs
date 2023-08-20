import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from "@rollup/plugin-terser";
import filesize from 'rollup-plugin-filesize';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';

export default {
    input: './src/index.mjs',
    external: ['react', '@jadesrochers/reacthelpers', '@jadesrochers/reacthelpers', 'ramda' ],
    output: [
      {
          format: 'umd',
          file: './dist/formbuilder-umd.js',
          name: 'formbuilder',
      },
    ],
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
        postcss({
                plugins: [autoprefixer()],
                sourceMap: true,
                extract: true,
                minimize: true
        }),
        nodeResolve(),
        commonjs(),
        terser(),
        filesize(),
    ]
}
