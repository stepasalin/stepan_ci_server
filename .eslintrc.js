module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['google', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-else-return': 'error',
    'require-jsdoc': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/prefer-literal-enum-member': ['error'],
  },
};
