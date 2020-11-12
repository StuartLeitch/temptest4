/* eslint-disable @typescript-eslint/no-var-requires */

const reporter = require('cucumber-html-reporter');

// const reportPath = process.argv[2];
// const [, type, name] = reportPath.split('/');

const options = {
  theme: 'bootstrap',
  jsonDir: 'reports/cucumber',
  output: `reports/cucumber/cucumber_report.html`,
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false,
  // screenshotsDirectory: 'reports/cucumber/screenshots/',
  // storeScreenshots: true,
  metadata: {
    // 'App Version': '0.3.2',
    // 'Test Environment': 'STAGING',
    // Browser: 'Chrome  54.0.2840.98',
    // Platform: 'Windows 10',
    // Parallel: 'Scenarios',
    // Executed: 'Remote',
  },
};

reporter.generate(options);
