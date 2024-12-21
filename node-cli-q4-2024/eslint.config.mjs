/* eslint-disable @typescript-eslint/naming-convention, import/no-default-export */

import { fixupPluginRules } from '@eslint/compat';
import parser from '@typescript-eslint/parser';
import globals from 'globals';
import security from 'eslint-plugin-security';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import eslintPluginPrettierConfig from 'eslint-plugin-prettier/recommended';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import functionalPlugin from 'eslint-plugin-functional';
import filenamesPlugin from 'eslint-plugin-filenames';

export default [
  {
    files: ['**/*.ts', '**/*.cts', '**/*.mts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      parser,
      parserOptions: {
        programs: [parser.createProgram('tsconfig.eslint.json')],
        ecmaVersion: 2023,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
  },

  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      ...typescriptEslint.configs['eslint-recommended'].rules,
      ...typescriptEslint.configs['recommended'].rules,
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': false,
          'ts-nocheck': false,
          'ts-check': false,
          minimumDescriptionLength: 15,
        },
      ],
      //not required, as Promises should always only return an `Either`
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', args: 'after-used', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },

        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow', //to skip "unused parameter" ts error
          trailingUnderscore: 'forbid',
        },

        {
          selector: 'memberLike',
          modifiers: ['static'],
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },

        {
          selector: 'memberLike',
          modifiers: ['private'],
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },

        {
          selector: 'typeLike',
          format: ['PascalCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },

        {
          selector: 'enum',
          format: ['UPPER_CASE'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
          suffix: ['_ENUM'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase'],
        },
      ],
    },
  },

  eslintConfigPrettier,
  eslintPluginPrettierConfig,

  {
    rules: {
      'prefer-promise-reject-errors': 'off',
      'linebreak-style': ['error', 'unix'],
      'no-debugger': 'error',
    },
  },

  security.configs.recommended,

  importPlugin.flatConfigs.typescript,
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/no-default-export': 'error',
    },
  },

  {
    plugins: {
      functional: functionalPlugin,
    },
    rules: {
      'functional/no-promise-reject': 'error',
      'functional/no-throw-statements': 'error',
      'functional/no-try-statements': 'error',
    },
  },

  {
    plugins: {
      filenames: fixupPluginRules(filenamesPlugin),
    },
    rules: {
      'filenames/match-exported': ['error', null, null, true],
      'filenames/no-index': 'error',
    },
  },
];
