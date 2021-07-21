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
        outputDirectory: 'coverage/apps/invoicing-graphql',
        outputName: 'junit.xml'
      }
    ]
  ],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/erp-integration',
};
