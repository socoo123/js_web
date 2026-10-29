import hooks from 'eslint-plugin-react-hooks';
export default [{
 files: ['**/*.{js,jsx}'],
 languageOptions: { ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } },
 plugins: { 'react-hooks': hooks },
 rules: { 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'error' },
}];
