module.exports = {
  extends: [
    'next/core-web-vitals',
    // other extends...
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    'no-var': ['error', { 'globals': false }],
  }
} 