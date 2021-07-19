module.exports = {
  testMatch: ['**/+(*.)+(spec|test|steps).+(ts|js)?(x)'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },
  resolver: '@nrwl/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  passWithNoTests: true,
  coverageReporters: ['lcov', 'json'],
  projects: '<rootDir>/apps/erp-integration',
};
