/* eslint-disable @typescript-eslint/no-var-requires */

const reporter = require('cucumber-html-reporter');

const reportPath = process.argv[2];

const options = {
  theme: 'bootstrap',
  jsonFile: `${reportPath}/cucumber_report.json`,
  output: `${reportPath}/cucumber_report.html`,
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false,
  metadata: {
    'App Version': '0.3.2',
    'Test Environment': 'STAGING',
    Browser: 'Chrome  54.0.2840.98',
    Platform: 'Windows 10',
    Parallel: 'Scenarios',
    Executed: 'Remote',
  },
};

reporter.generate(options);
