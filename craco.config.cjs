const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  jest: {
    configure: (jestConfig, { env, paths, resolve, rootDir }) => {
      const moduleNameMapper = {
        '^@core(.*)$': `${rootDir}/src/core$1`,
        '^@hooks(.*)$': `${rootDixr}/src/hooks$1`,
        '^@utils(.*)$': `${rootDir}/src/utils$1`,
      }

      return { ...jestConfig, moduleNameMapper };
    },
  },
};
