'use strict';

exports.__esModule = true;
exports.createTimestamp = void 0;
var architect_1 = require('@angular-devkit/architect');
var rxjs_1 = require('rxjs');
var execa_1 = require('execa');
var path_1 = require('path');
var operators_1 = require('rxjs/operators');
var core_1 = require('@angular-devkit/core');
var fs_1 = require('fs');
var dateFormat = require('dateformat');
function createCucumber(options, context) {
  var path = options.path,
    format = options.format,
    supportEntryPath = options.steps,
    runCoverage = options.coverage,
    workspaceRoot = context.workspaceRoot,
    logger = context.logger;
  // console.info(workspaceRoot);
  // console.info(path);
  var fullPath = `${core_1.getSystemPath(
    core_1.normalize(workspaceRoot)
  )}/${path}`;
  // console.info(noapte);
  // var writeFileObservable = rxjs_1.bindNodeCallback(fs_1.writeFile);
  var subprocess = execa_1(
    path_1.join('node_modules', '.bin', 'cucumber-js'),
    [
      options.features,
      '--require',
      supportEntryPath,
      '--format',
      `${format}:${fullPath}/cucumber_report.json`,
    ],
    { env: { TS_NODE_PROJECT: options.tsConfig } }
  );
  subprocess.stdout.pipe(process.stdout);
  subprocess.stderr.pipe(process.stderr);
  // var bundleTarget = architect_1.targetFromTargetString(options.bundleTarget);
  // var bundle$ = architect_1.scheduleTargetAndForget(context, bundleTarget);
  var cucumberLogger = logger.createChild('Cucumber:');
  return rxjs_1.from(subprocess).pipe(
    operators_1.map(function () {
      if (runCoverage) {
        execa_1(
          path_1.join('tools', 'scripts', 'cucumber-report.sh', fullPath),
          {
            shell: true,
          }
        ).stdout.pipe(process.stdout);
      }

      return { success: true };
    }),
    operators_1.tap(function () {
      //  return timestampLogger.info('Timestamp created');
    }),
    operators_1.catchError(function (e) {
      console.error(e);
      cucumberLogger.error('Cucumber execution error', e);
      return rxjs_1.of({ success: false });
    })
  );
}
exports.createCucumber = createCucumber;
exports['default'] = architect_1.createBuilder(createCucumber);
