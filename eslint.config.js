// ESLint flat config. Expo's recommended rules keep React Native code safe.
// Run with `npm run lint`; this same command runs in the GitHub update workflow.
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/**', '.expo/**', 'node_modules/**', 'scripts/**'],
    rules: {
      // This advisory comes from React Compiler. The app does not enable the
      // compiler, and the screens intentionally sync fetched data into state.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];
