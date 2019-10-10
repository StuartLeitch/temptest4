module.exports = {
  name: 'react-components',
  preset: '../../jest.config.js',
  setupFiles: ['./setupTests.ts'],
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  reporters: ['default',
    ['jest-junit', {
      outputDirectory: 'coverage/libs/react-components',
      outputName: 'junit.xml'
    }]
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html']
};
