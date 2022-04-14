module.exports = {
  displayName: 'lib-import-manuscript-commons',
  testMatch: ['__test__/*/*Test.ts'],
  preset: './jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/import-manuscript-commons',
};
