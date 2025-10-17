const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Otimizações para reduzir o tamanho do bundle
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: false,
    keep_fnames: false,
    mangle: {
      toplevel: true,
    },
    compress: {
      drop_console: true,
      drop_debugger: true,
      dead_code: true,
    },
  },
};

module.exports = config;
