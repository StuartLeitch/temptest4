module.exports = {
  default: [
    'integration-tests/features/**/*.feature',
    '--require-module ts-node/register',
    '--require integration-tests/step-definitions/**/*.ts',
    '--format progress-bar',
    '--format cucumber-pretty',
    `--format-options '{"snippetInterface": "synchronous"}'`,
  ].join(' '),
};
