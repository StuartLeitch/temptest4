module.exports = {
  name: 'import-manuscript-backend',
  preset: '../../jest.config.js',
  transform: {
    '^.+\\.graphql$': 'graphql-import-node/jest'
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage/apps/import-manuscript-backend',
        outputName: 'junit.xml'
      }
    ]
  ],
  coverageDirectory: '../../coverage/apps/import-manuscript-backend'
};
