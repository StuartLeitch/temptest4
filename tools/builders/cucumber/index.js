'use strict';

exports.__esModule = true;
exports.createCucumber = void 0;

var architect = require('@angular-devkit/architect');
var rxjs = require('rxjs');
var execa = require('execa');
var path = require('path');
var fs = require('fs');
var operators = require('rxjs/operators');
var core = require('@angular-devkit/core');
// var fs = require('fs');
// var dateFormat = require('dateformat');
function createCucumber(options, context) {
  var _path = options.path,
    format = options.format,
    supportEntryPath = options.steps,
    runCoverage = options.coverage,
    workspaceRoot = context.workspaceRoot,
    logger = context.logger;

  var fullPath = `${core.getSystemPath(
    core.normalize(workspaceRoot)
  )}/${_path}`;

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  var command = path.join('node_modules', '.bin', 'nyc');
  var args = [
    // 'report',
    '--report-dir',
    fullPath,
    '--reporter=lcov',
    '--reporter=text',
    path.join('node_modules', '.bin', 'cucumber-js'),
    options.features,
    '--require',
    supportEntryPath,
    '--format',
    `${format}:${fullPath}/cucumber_report.json`,
    '--format',
    `usage:${fullPath}/usage.txt`,
  ];

  // TS_NODE_PROJECT=apps/invoicing-graphql/tsconfig.spec.json ./node_modules/.bin/nyc --report-dir report/apps/invoicing-graphql --reporter=lcov --reporter=text node_modules/.bin/cucumber-js --require-module ts-node/register --require-module tsconfig-paths/register --require apps/invoicing-graphql/tests/**/*.steps.ts apps/invoicing-graphql/tests/**/*.feature
  var subprocess = execa(command, args, {
    env: {
      TS_NODE_PROJECT: options.tsConfig,
    },
  });

  var cucumberLogger = logger.createChild('Cucumber:');
  return rxjs.from(subprocess).pipe(
    operators.map(function () {
      if (runCoverage) {
        execa(path.join('tools', 'scripts', 'cucumber-report.sh', fullPath), {
          shell: true,
        }).stdout.pipe(process.stdout);

        //   // execa(
        //   //   path.join('tools', 'scripts', 'generate-coverage.sh', fullPath),
        //   //   {
        //   //     shell: true,
        //   //   }
        //   // ).stdout.pipe(process.stdout);
      }

      return { success: true };
    }),
    operators.tap(function () {
      return cucumberLogger.info(`Cucumber report created at ${fullPath}`);
    }),
    operators.catchError(function (e) {
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
