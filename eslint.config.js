// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

// ESLint v9+ flat config
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  // Ignorer UNIQUEMENT les artefacts générés (ne PAS ignorer src/ ni tests/)
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'dist-backend/**',
      'build/**',
      'coverage/**',
      '.vite/**',
      '.next/**',
      '.cypress/**',
      '.playwright/**',
      'playwright-report/**',
      '.venv/**',
      'database/**',
      'e2e/**',
      'scripts/**',
      'prisma/**',
      'tailwind.config.js',
      'playwright.config.ts',
      'vite.config.ts',
      '**/*.min.js',
      '**/*.bundle.js',
      '**/*.map'
    ]
  },
  // Base JS recommended
  js.configs.recommended,
  // Règles pour l'app (front/back) + tests
  {
    files: [
      'src/**/*.{ts,tsx,js,jsx}',
      'tests/**/*.{ts,tsx,js,jsx}',
      'backend/**/*.{ts,js}'
    ],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      // IMPORTANT : évite les faux positifs sur les types DOM/JSX etc.
      'no-undef': 'off',

      // TS recommandé (sans type-check)
      ...tsPlugin.configs.recommended.rules,

      // Adoucir la friction pour avancer vite (tu pourras resserrer ensuite)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      'no-empty': ['warn', { allowEmptyCatch: true }],

      // React
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Fast Refresh (vite)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
    }
  },
  // (Optionnel) Overrides backend pur JS si besoin
  {
    files: ['backend/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: globals.node
    },
    rules: {}
  },
  ...storybook.configs["flat/recommended"]
];
