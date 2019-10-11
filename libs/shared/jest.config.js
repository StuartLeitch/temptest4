module.exports = {
  name: 'shared',
  preset: '../../jest.config.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage/libs/shared',
        outputName: 'junit.xml'
      }
    ]
  ],
  collectCoverage: true,
  coverageDirectory: '../../coverage/libs/shared'
};
