const fs = require('fs');
const path = require('path');
const exec = require('shelljs.exec');

const { env } = process;

import {kill, sleep, logWithTime, runtimeCost } from './utils';
import {REPORTING_TABLES} from '../../libs/shared/src/lib/modules/reporting/constants';

const runtime = {
  start: new Date(),
  end: new Date()
};

const eventsTables = Object.values(REPORTING_TABLES);å

const sourceURI = `postgresql://${env.SOURCE_DB_USERNAME}:${env.SOURCE_DB_PASSWORD}@${env.SOURCE_DB_HOST}:5432/${env.SOURCE_DB_DATABASE}`;
const targetURI = `postgresql://${env.TARGET_DB_USERNAME}:"${env.TARGET_DB_PASSWORD.replace("$", "\\$")}"@${env.TARGET_DB_HOST}:5432/${env.TARGET_DB_DATABASE}`;

const main = async () => {

  const sourceCopyCommand = 'COPY (SELECT * FROM submission_events WHERE time IS NOT NULL ORDER BY time LIMIT 10000) TO STDOUT CSV HEADER';
  const targetCopyCommand = 'COPY submission_events FROM STDIN CSV HEADER';
  const submissionEventsCopyCommand = `psql ${sourceURI} -qtAXc "${sourceCopyCommand}" | psql ${targetURI} -qtAXc "${targetCopyCommand}"`;

  logWithTime('START', runtime);
  await new Promise(async (resolve, reject) => {
    const copyCmd = exec(submissionEventsCopyCommand, { silent: false });
    resolve(null);
  })

  logWithTime('END', runtime);
  runtimeCost(runtime);

  process.exit(0);


};

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(0);
}
