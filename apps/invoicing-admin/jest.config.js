module.exports = {
  name: 'invoicing-admin',
  preset: '../../jest.config.js',
  transform: {
    '^.+\\.graphql$': 'graphql-import-node/jest'
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage/apps/invoicing-admin',
        outputName: 'junit.xml'
      }
    ]
  ],
  coverageDirectory: '../../coverage/apps/invoicing-admin'
};
