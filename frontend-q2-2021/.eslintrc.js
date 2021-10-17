const { resolve } = require('path');

const namingConventions = (vue) => [
  {
    selector: 'default',
    format: ['camelCase'],
    leadingUnderscore: 'forbid',
    trailingUnderscore: 'forbid',
    filter: {
      regex: '(Just|Nothing|Left|Right)', //thanks, purify-ts!!
      match: false,
    }
  },

  {
    selector: 'variable',
    format: ['camelCase', 'UPPER_CASE', ...(vue ? ['PascalCase'] : []) ],
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
    suffix: ['_ENUM']
  },
  {
    selector: 'enumMember',
    format: ['UPPER_CASE'],
    leadingUnderscore: 'forbid',
    trailingUnderscore: 'forbid',
  },
  {
    selector: 'objectLiteralProperty',
    format: ['camelCase', 'PascalCase'],
    leadingUnderscore: 'forbid',
    trailingUnderscore: 'forbid',
  },
];

module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: true,

  // https://eslint.vuejs.org/user-guide/#how-to-use-custom-parser
  // Must use parserOptions instead of "parser" to allow vue-eslint-parser to keep working
  // `parser: 'vue-eslint-parser'` is already included with any 'plugin:vue/**' config and should be omitted
  parserOptions: {
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser#configuration
    // https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#eslint
    // Needed to make the parser take into account 'vue' files
    extraFileExtensions: ['.vue'],
    parser: '@typescript-eslint/parser',
    project: resolve(__dirname, './tsconfig.json'),
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports
  },

  env: {
    browser: true
  },

  // Rules order is important, please avoid shuffling them
  extends: [
    // Base ESLint recommended rules
    // 'eslint:recommended',

    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#usage
    // ESLint typescript rules
    'plugin:@typescript-eslint/recommended',
    // consider disabling this class of rules if linting takes too long
    'plugin:@typescript-eslint/recommended-requiring-type-checking',

    // Uncomment any of the lines below to choose desired strictness,
    // but leave only one uncommented!
    // See https://eslint.vuejs.org/rules/#available-rules
    //'plugin:vue/essential', // Priority A: Essential (Error Prevention)
    // 'plugin:vue/strongly-recommended', // Priority B: Strongly Recommended (Improving Readability)
     'plugin:vue/recommended', // Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead)

    // https://github.com/prettier/eslint-config-prettier#installation
    // usage with Prettier, provided by 'eslint-config-prettier'.
    'prettier',
  ],

  plugins: [
    // required to apply rules which need type information
    '@typescript-eslint',

    // https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-file
    // required to lint *.vue files
    'vue',

    "prettier",

    "ts-immutable",

    'import',

    'filenames',

    'folders'
  ],

  globals: {
    ga: 'readonly', // Google Analytics
    cordova: 'readonly',
    __statics: 'readonly',
    process: 'readonly',
    Capacitor: 'readonly',
    chrome: 'readonly'
  },

  // add your custom rules here
  rules: {
    'prefer-promise-reject-errors': 'off',

    '@typescript-eslint/ban-ts-comment': ['error', {
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': false,
      'ts-nocheck': false,
      'ts-check': false,
      minimumDescriptionLength: 15,
    }],

    //not required, as Promises should always only return an `Either`
    '@typescript-eslint/no-floating-promises': 'off',

    // TypeScript
    quotes: ['error', 'single', { avoidEscape: true }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "prettier/prettier": "error",
    "linebreak-style": ["error", "unix"],

    'folders/match-regex': [2, '^[0-9a-z][0-9a-z-]+$', '/src/'],

    //ts-immutable
    "ts-immutable/no-throw": 'error',
    "ts-immutable/no-reject": 'error',
    "ts-immutable/immutable-data": ['error', {
      ignoreAccessorPattern: [
        'module', //js exports
        'this', //allow editing TOP LEVEL parameters within classes - they are expected to be mutable
        'this.$data', //allow editing TOP LEVEL data objects within vue objects - they are expected to be mutable
        'this.state', //allow editing TOP LEVEL state objects within vue objects - they are expected to be mutable
        'this.$router', //it isn't an array, but it has a "push" function...
      ]
    }],

    //vue
    "vue/component-tags-order": ["error", {
      "order": [ "style", "template", "script" ]
    }],

    'import/no-default-export': 2,
    'import/no-relative-parent-imports': 'error',

    'filenames/match-exported': [ 2, null, '\\.vue$', true ],
    'filenames/no-index': 2,

    '@typescript-eslint/naming-convention': ['error', ...namingConventions(false) ],
  },
  overrides: [
    {
      files: [ './**/*.vue' ],
      rules: {
        '@typescript-eslint/naming-convention': ['error', ...namingConventions(true) ],
        'filenames/match-regex': [2, '^([A-Z][a-z0-9]+)+$', true],
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        'import/no-default-export': 'off',
      }
    },
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        'filenames/match-exported': 'off',
        '@typescript-eslint/naming-convention': 'off',
      },
    },
  ],
}
