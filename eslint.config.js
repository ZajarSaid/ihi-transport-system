import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import babelParser from '@babel/eslint-parser'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'backend',
    'sidebar-analysis.txt',
    '.next',
    'out',
    'src/generated',
    'next-env.d.ts',
  ]),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // TypeScript needs a parser that understands it. typescript-eslint
    // refuses to run against TypeScript 7, so Babel parses the syntax
    // instead — the type-aware rules were never enabled anyway.
    files: ['**/*.ts'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          parserOpts: { plugins: ['typescript'] },
        },
      },
    },
    rules: {
      // These two rules cannot see through type syntax: a type-only import
      // looks like an unused variable, and a type name looks like an
      // undefined one. TypeScript itself reports both.
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.tsx'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          parserOpts: { plugins: ['typescript', 'jsx'] },
        },
      },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['src/hooks/**/*.{js,jsx}', 'src/screens/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      'no-undef': 'off',
    },
  },
  {
    // The seed script and the Prisma client run in Node, not the browser.
    files: ['prisma/**/*.ts', 'src/lib/prisma.ts', 'prisma.config.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // Next.js route files legitimately export things that are not components
    // — `metadata`, `generateMetadata`, `generateStaticParams` — and Fast
    // Refresh is scoped to the whole route there, not to a single export.
    files: ['app/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
