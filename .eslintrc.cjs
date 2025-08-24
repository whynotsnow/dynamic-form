module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
  env: { browser: true, es2021: true, node: true },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'jsx-a11y', 'prettier', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
    'prettier'
  ],
  rules: {
    'react/prop-types': 'off', // TS 项目关闭 prop-types 检查
    'react/react-in-jsx-scope': 'off', // React 引入检查
    'prettier/prettier': ['error'], // Prettier
    'import/no-cycle': ['error', { maxDepth: 5 }], // 循环依赖检查
    // TypeScript 规则调整
    '@typescript-eslint/no-explicit-any': 'warn', // any 类型改为警告
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ] // 未使用变量改为警告
  },
  settings: { react: { version: 'detect' } },
  ignorePatterns: ['dist/', 'node_modules/']
};
