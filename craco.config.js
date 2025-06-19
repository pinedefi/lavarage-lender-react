const webpack = require('webpack');
const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      process: 'process/browser.js',
    },
    configure: (config) => {
      config.resolve = {
        ...config.resolve,
        fallback: {
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          buffer: require.resolve('buffer/'),
          process: require.resolve('process/browser.js'),
        },
      };

      config.module = {
        ...config.module,
        rules: config.module.rules.map((rule) => {
          if (rule.oneOf instanceof Array) {
            // eslint-disable-next-line no-param-reassign
            rule.oneOf[rule.oneOf.length - 1].exclude = [
              /\.(js|mjs|jsx|cjs|ts|tsx)$/,
              /\.html$/,
              /\.json$/,
            ];
          }
          return rule;
        }),
      };

      config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser.js',
        }),
      ];

      return config;
    },
  },
};
