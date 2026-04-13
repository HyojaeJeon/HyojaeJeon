module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    'nativewind/babel',
  ],
  plugins: [
    'babel-plugin-react-compiler',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
          '@': './src',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@providers': './src/providers',
          '@graphql': './src/graphql',
          '@store': './src/store',
          '@shared': './src/shared',
          '@services': './src/services',
          '@config': './src/config',
          '@assets': './src/assets',
          '@i18n': './src/i18n',
        },
      },
    ],
    // Reanimated 플러그인은 반드시 마지막에 추가
    'react-native-reanimated/plugin',
  ],
};
