import { env } from '../env';
import { Logger } from '../lib/logger';

export function banner(log: Logger): void {
  log.info(`App is ready on ${env.app.port}`);
  log.info(`To shut it down, press <CTRL> + C at any time.`);
  log.info(``);
  log.info('-------------------------------------------------------');
  log.info(`Environment  : ${env.node}`);
  log.info(`Version      : ${env.app.version}`);
  log.info(``);

  log.info('-------------------------------------------------------');
  log.info('');
}
