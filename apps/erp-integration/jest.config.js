module.exports = {
  displayName: 'erp-integration',
  preset: '../../jest.config.js',
  transform: {
    '^.+\\.graphql$': 'graphql-import-node/jest'
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage/apps/erp-integration',
        outputName: 'junit.xml'
      }
    ]
  ],
  coverageDirectory: '../../coverage/apps/erp-integration',
};
