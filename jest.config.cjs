const { TextEncoder } = require("util");
// const fetch = require("node-fetch");
// import fetch from 'node-fetch';

module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@core(.*)$': `<rootDir>/src/core$1`,
    '^@hooks(.*)$': `<rootDir>/src/hooks$1`,
    '^@utils(.*)$': `<rootDir>/src/utils$1`,
  },
  collectCoverageFrom: [
    "src/**/*.ts",
  ],
  modulePathIgnorePatterns: [
    "/node_modules/",
    "/.github/",
    "/dist/",
    "/example/",
    "/images/"
  ],
  globals: {
    "TextEncoder": TextEncoder,
    // "fetch": fetch,
  },
  roots: [
    "<rootDir>/src/",
    // "<rootDir>/__mocks__/"
  ],
  transform: {
    '\\.ts$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
};
