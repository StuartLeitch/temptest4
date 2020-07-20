const common = [
  // '--require ./libs/shared/src/lib/modules/journals/usecases/boom/boom.feature', // Specify our feature files
  // '--require-module @babel/register', // Load Babel module
  '--require-module ts-node/register', // Load TypeScript module
  '--require-module tsconfig-paths/register', // Load TypeScript module
  '--parallel 4',
  `--format ${
    process.env.CI || !process.stdout.isTTY ? 'progress' : 'progress-bar'
  }`,
  // '--format rerun:@rerun.txt',
  // '--format usage:usage.txt',
  // '--format junit:junit.xml',
  // '--format json:report/cucumber_report.json',
  // '--format node_modules/cucumber-junit-formatter:report/apps/invoicing-graphql/junit.xml', // Load custom formatter
  // '--format node_modules/cucumber-pretty', // Load custom formatter
  // '--format json', // Load custom formatter
  `--format-options '{"snippetInterface": "synchronous"}'`, // Custom formatting
].join(' ');

module.exports = {
  default: common,
};
