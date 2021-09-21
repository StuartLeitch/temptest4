module.exports = {
  displayName: 'invoicing-revenue-recognition-registration',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage/apps/invoicing-revenue-recognition-registration',
        outputName: 'junit.xml'
      }
    ]
  ],
  moduleFileExtensions: ['ts', 'js', 'html'],
  setupFilesAfterEnv: ['./tests/setupTests.ts'],
  coverageDirectory:
    '../../../coverage/apps/invoicing-revenue-recognition-registration',
};
