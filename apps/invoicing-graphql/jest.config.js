module.exports = {
  name: 'invoicing-graphql',
  preset: '../../jest.config.js',
  transform: {
    '^.+\\.graphql$': 'graphql-import-node/jest'
  },
  reporters: ['default',
    ['jest-junit', {
      outputDirectory: 'coverage/apps/invoicing-graphql',
      outputName: 'junit.xml'
    }]
  ],
};
