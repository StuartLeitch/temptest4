// More profiles can be added if desired
module.exports = {
  default: [
    'integration-tests/features/**/*.feature',
    '--require-module ts-node/register',
    '--require integration-tests/step-definitions/**/*.ts',
    '--format progress-bar',
    '--format ../../node_modules/cucumber-pretty'
  ].join(' ')
};
