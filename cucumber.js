const common = [
  // '--require ./libs/shared/src/lib/modules/journals/usecases/boom/boom.feature', // Specify our feature files
  // '--require-module @babel/register', // Load Babel module
  '--require-module ts-node/register', // Load TypeScript module
  '--require ./libs/shared/src/lib/modules/journals/usecases/editorialBoards/**/*.steps.ts', // Load step definitions
  '--require ./apps/invoicing-graphql/tests/eventHandlers/*.steps.ts', // Load step definitions
  '--require ./libs/shared/tests/**/*.steps.ts', // Load step definitions
  '--require ./libs/shared/tests/*.steps.ts', // Load step definitions

  // '--format progress-bar', // Load custom formatter
  '--format node_modules/cucumber-pretty', // Load custom formatter
  // '--format json', // Load custom formatter
  `--format-options '{"snippetInterface": "synchronous"}'`, // Custom formatting
].join(' ');

module.exports = {
  default: common,
};
