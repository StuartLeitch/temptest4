module.exports = {
  default: [
    '--require libs/shared/src/lib/modules/journals/usecases/boom/*.feature',
    '--require-module ts-node/register',
    // '--require libs/shared/src/lib/modules/journals/usecases/**/*.steps.ts',
    '--format progress-bar',
    // '--format cucumber-pretty',
    `--format-options '{"snippetInterface": "synchronous"}'`,
  ].join(' '),
};
