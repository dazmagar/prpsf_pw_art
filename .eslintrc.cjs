module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended', 'plugin:playwright/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['eslint-plugin-no-inline-styles'],
  rules: {
    'prettier/prettier': 'error',
    indent: ['error', 2, { SwitchCase: 1 }],
    semi: ['error', 'always'],
    'prefer-const': ['error'],
    quotes: ['error', 'single'],
    'no-inline-styles/no-inline-styles': 2,
    'no-multi-spaces': ['error'],
    curly: ['error', 'all'],
    'operator-linebreak': ['error', 'after'],
    'no-trailing-spaces': ['error'],
    'no-cond-assign': ['error', 'always'],
    'no-return-assign': ['error', 'always'],
    'playwright/no-conditional-in-test': 'off',
    'playwright/expect-expect': 'off'
  },
  ignorePatterns: ['dist', 'node_modules']
};
