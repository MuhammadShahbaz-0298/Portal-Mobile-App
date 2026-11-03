// ESLint flat config. Expo's recommended rules keep React Native code safe.
// Run with `npm run lint`; this same command runs in the GitHub update workflow.
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/**', '.expo/**', 'node_modules/**', 'scripts/**'],
    languageOptions: {
      sourceType: 'module',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.cjs', '.mjs'],
        },
      },
    },
    rules: {
      // import/no-unresolved is unreliable with flat config on Windows;
      // Metro catches unresolved imports at build time instead.
      'import/no-unresolved': 'off',
      // expo-splash-screen exports preventAutoHideAsync/hide but the
      // import plugin's namespace check can't resolve them reliably.
      'import/namespace': 'off',
      // This advisory comes from React Compiler. The app does not enable the
      // compiler, and the screens intentionally sync fetched data into state.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];
