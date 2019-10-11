module.exports = {
  name: 'invoicing-cli',
  preset: '../../jest.config.js',
  reporters: ['default',
    ['jest-junit', {
      outputDirectory: 'coverage/apps/invoicing-cli',
      outputName: 'junit.xml'
    }]
  ],
  coverageDirectory: '../../coverage/apps/invoicing-cli'
};
