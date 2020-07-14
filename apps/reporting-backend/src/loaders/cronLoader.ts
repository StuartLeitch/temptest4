import { CronJob } from 'cron';
import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import { env } from '../env';
import { refreshViews, refreshAcceptanceRates } from '../infrastructure/crons';

export const cronLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  const db = settings.getData('connection');

  const refreshViewJob = new CronJob(env.app.viewRefreshCron, async () => {
    refreshViews(db);
  });
  refreshViewJob.start();

  const acceptanceRatesJob = new CronJob(env.app.acceptanceRatesCron, () => {
    refreshAcceptanceRates(db);
  });
  acceptanceRatesJob.start();
};
