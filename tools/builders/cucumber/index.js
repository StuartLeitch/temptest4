/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

'use strict';

exports.__esModule = true;
exports.createCucumber = void 0;

const architect = require('@angular-devkit/architect');
const rxjs = require('rxjs');
const execa = require('execa');
const path = require('path');
const fs = require('fs');
const { map, tap, catchError } = require('rxjs/operators');
const core = require('@angular-devkit/core');
// var fs = require('fs');
// var dateFormat = require('dateformat');
function createCucumber(options, context) {
  const [type, name] = options.path.split('/'),
    { format } = options,
    supportEntryPath = options.steps,
    runCoverage = options.coverage,
    { workspaceRoot } = context,
    { logger } = context;

  const fullPath = `${core.getSystemPath(
    core.normalize(workspaceRoot)
  )}/reports`;

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  const command = path.join('node_modules', '.bin', 'nyc');
  const args = [
    '--report-dir',
    `${fullPath}/coverage`,
    '--reporter=json',
    '--reporter=text',
    path.join('node_modules', '.bin', 'cucumber-js'),
    options.features,
    '--require',
    supportEntryPath,
    '--format',
    `${format}:${fullPath}/cucumber/${type}_${name}_cucumber_report.json`,
    '--format',
    `usage:${fullPath}/cucumber/${type}_${name}_usage.txt`,
  ];

  // eslint-disable-next-line max-len
  // TS_NODE_PROJECT=apps/invoicing-graphql/tsconfig.spec.json ./node_modules/.bin/nyc --report-dir report/apps/invoicing-graphql --reporter=lcov --reporter=text node_modules/.bin/cucumber-js --require-module ts-node/register --require-module tsconfig-paths/register --require apps/invoicing-graphql/tests/**/*.steps.ts apps/invoicing-graphql/tests/**/*.feature
  const subprocess = execa(command, args, {
    env: {
      TS_NODE_PROJECT: options.tsConfig,
    },
  });

  const cucumberLogger = logger.createChild('Cucumber:');
  return rxjs.from(subprocess).pipe(
    map(() => {
      if (runCoverage) {
        // do nothing yet
      }
      return { success: true };
    }),
    tap(() => {
      return cucumberLogger.info(`Cucumber report created at ${fullPath}`);
    }),
    catchError((e) => {
      console.error(e);
      cucumberLogger.error('Cucumber execution error', e);
      return rxjs.of({
        success: false,
      });
    })
  );
}
exports.createCucumber = createCucumber;
exports['default'] = architect.createBuilder(createCucumber);
