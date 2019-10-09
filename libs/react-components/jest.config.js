module.exports = {
  name: 'react-components',
  preset: '../../jest.config.js',
  setupFiles: ['./setupTests.ts'],
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../coverage/libs/react-components'
};
