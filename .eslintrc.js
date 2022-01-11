'use strict';

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  plugins: ['ember'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
  },
  rules: {},
  overrides: [
    // node files
    {
      files: [
        './.eslintrc.js',
        './.prettierrc.js',
        './.template-lintrc.js',
        './ember-cli-build.js',
        './index.js',
        './testem.js',
        './blueprints/*/index.js',
        './config/**/*.js',
        './tests/dummy/config/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
    },
    {
      // test files
      files: ['tests/**/*-test.{js,ts}'],
      extends: ['plugin:qunit/recommended'],
    },
    // typescript files
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
      ],
      rules: {
        'prefer-const': 0,
        semi: 0,
        '@typescript-eslint/array-type': [2, { default: 'array-simple' }],
        '@typescript-eslint/ban-ts-comment': [
          2,
          {
            'ts-expect-error': 'allow-with-description',
            'ts-ignore': true,
          },
        ],
        '@typescript-eslint/consistent-type-assertions': 2,
        '@typescript-eslint/explicit-member-accessibility': [
          2,
          { accessibility: 'no-public' },
        ],
        '@typescript-eslint/explicit-function-return-type': 2,
        '@typescript-eslint/no-base-to-string': 2,
        '@typescript-eslint/no-confusing-non-null-assertion': 2,
        '@typescript-eslint/no-dynamic-delete': 2,
        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/no-extra-semi': 2,
        '@typescript-eslint/no-extraneous-class': 2,
        '@typescript-eslint/no-implicit-any-catch': 2,
        '@typescript-eslint/no-invalid-void-type': 2,
        '@typescript-eslint/no-require-imports': 2,
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': 2,
        '@typescript-eslint/no-unnecessary-qualifier': 2,
        '@typescript-eslint/no-unnecessary-type-arguments': 2,
        '@typescript-eslint/no-unused-vars': [2, { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-use-before-define': [2, { functions: false }],
        '@typescript-eslint/prefer-enum-initializers': 2,
        '@typescript-eslint/prefer-for-of': 2,
        '@typescript-eslint/prefer-includes': 2,
        '@typescript-eslint/prefer-literal-enum-member': 2,
        '@typescript-eslint/prefer-string-starts-ends-with': 2,
        '@typescript-eslint/require-array-sort-compare': 2,
        '@typescript-eslint/semi': 2,
        '@typescript-eslint/switch-exhaustiveness-check': 2,
        '@typescript-eslint/type-annotation-spacing': 2,
        '@typescript-eslint/unbound-method': 0, // We use unbound methods regularly in Ember
        '@typescript-eslint/unified-signatures': 2,
        'no-use-before-define': 0,
      },
    },
  ],
};
