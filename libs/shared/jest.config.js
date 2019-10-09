module.exports = {
  name: 'shared',
  preset: '../../jest.config.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../coverage/libs/shared'
  // transform: {
  // 	'^.+\\.(t|j)sx?$': 'ts-jest'
  // },
  // testMatch: [
  // 	'**/*.steps.ts',
  // 	'**/__tests__/**/*.[jt]s?(x)',
  // 	'**/?(*.)+(spec|test).[jt]s?(x)'
  // ],
  // // testRegex: '(**/*.steps|/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  // moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // setupFilesAfterEnv: [
  // 	'./specs/utils/setupTests.ts'
  // ],
  // globals: {
  // 	'ts-jest': {
  // 		tsConfig: {
  // 			jsx: 'react'
  // 		}
  // 	}
  // }
};
