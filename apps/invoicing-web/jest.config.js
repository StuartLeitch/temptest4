module.exports = {
  name: 'invoicing-web',
  preset: '../../jest.config.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  reporters: ['default',
    ['jest-junit', {
      outputDirectory: 'coverage/apps/invoicing-web',
      outputName: 'junit.xml'
    }]
  ],
  coverageDirectory: '../../coverage/apps/invoicing-web'
};
