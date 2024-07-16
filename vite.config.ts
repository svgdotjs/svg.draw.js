import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import pkg from './package.json' with { type: 'json' }

const buildDate = Date()

const headerLong = `/*!
* ${pkg.name} - ${pkg.description}
* @version ${pkg.version}
* ${pkg.homepage}
*
* @copyright ${pkg.author}
* @license ${pkg.license}
*
* BUILT: ${buildDate}
*/;`

const headerShort = `/*! ${pkg.name} v${pkg.version} ${pkg.license}*/;`

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve('./src/main.js'),
      name: 'svg.draw.js',
      fileName: 'svg.draw',
      formats: ['iife', 'es', 'umd'],
    },
    rollupOptions: {
      external: ['@svgdotjs/svg.js'],
      output: {
        globals: {
          '@svgdotjs/svg.js': 'SVG',
        },
        banner: headerLong,
        assetFileNames: 'svg.draw.[ext]',
      },
    },
    minify: 'terser',
    terserOptions: {
      output: {
        preamble: headerShort,
        comments: false,
      },
    },
  },
})
