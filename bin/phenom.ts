#!/usr/bin/env node

require('tsconfig-paths/register');

/* tslint:disable */
// check if we're running in dev mode
var devMode = require('fs').existsSync(
  `${__dirname}/../apps/invoicing-cli/src`
);
// or want to "force" running the compiled version with --compiled-build
var wantsCompiled = process.argv.indexOf('--compiled-build') >= 0;

var tsConfig = require(`${__dirname}/../apps/invoicing-cli/tsconfig.json`);

if (wantsCompiled || !devMode) {
  // this runs from the compiled javascript source
  require(`${__dirname}/../dist/apps/invoicing-cli`).run(process.argv);
} else {
  // this runs from the typescript source (for dev only)
  // hook into ts-node so we can run typescript on the fly
  require('ts-node').register({
    project: `${__dirname}/../tsconfig.json`,
    compilerOptions: tsConfig.compilerOptions
  });

  // run the CLI with the current process arguments
  require(`${__dirname}/../apps/invoicing-cli/src/main`).run(process.argv);
}
