module.exports = {
  testMatch: ['**/+(*.)+(spec).+(ts|js)?(x)'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },
  resolver: '@nrwl/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  passWithNoTests: true,
  coverageReporters: ['lcov', 'json'],
};
