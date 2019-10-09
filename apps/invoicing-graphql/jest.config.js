// const tsconfig = require('./tsconfig.json');
// const moduleNameMapper = require('tsconfig-paths-jest')(tsconfig);

// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   transform: {
//     '^.+\\.graphql$': 'graphql-import-node/jest'
//   },
//   watchPathIgnorePatterns: ['./node_modules/', './dev/', './migrations/'],
//   moduleNameMapper
// };

module.exports = {
  name: 'invoicing-graphql',
  preset: '../../jest.config.js',
  transform: {
    '^.+\\.graphql$': 'graphql-import-node/jest'
  },
  coverageDirectory: '../../coverage/apps/invoicing-graphql'
};
