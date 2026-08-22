import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import * as reactHooks from 'eslint-plugin-react-hooks'

const flatRecommended = react.configs.flat.recommended
const flatJsxRuntime = react.configs.flat['jsx-runtime']

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      ...flatRecommended.plugins,
      'react-hooks': {
        rules: reactHooks.rules,
        meta: reactHooks.meta,
      },
    },
    languageOptions: {
      ...flatRecommended.languageOptions,
      ...flatJsxRuntime.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...flatRecommended.rules,
      ...flatJsxRuntime.rules,
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['vite.config.js', 'postcss.config.js', 'tailwind.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
]
