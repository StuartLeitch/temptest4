import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import { CronJob } from 'cron';

import { env } from '../env';
import { refreshViews } from '../infrastructure/views';

export const cronLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  const db = settings.getData('connection');
  var refreshViewJob = new CronJob(env.app.viewRefreshCron, async () => {
    refreshViews(db);
  });
  refreshViewJob.start();
};
