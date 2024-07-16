import js from '@eslint/js'
import importX from 'eslint-plugin-import-x'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    plugins: {
      importX,
    },
    languageOptions: {
      globals: globals.browser,
    },
  },
]
