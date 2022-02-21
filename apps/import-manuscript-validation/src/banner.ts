import { LoggerContract } from '@hindawi/shared';

import { env } from './env';

export function banner(log: LoggerContract): void {
  if (env.app.banner) {
    // log.info(`App is ready on ${route()}${env.app.routePrefix}`);
    // log.info(`To shut it down, press <CTRL> + C at any time.`);
    log.info(`Environment  : ${env.node}`);
    log.info(`Version      : ${env.app.version}`);
    // if (env.swagger.enabled) {
    //   log.info(`Swagger      : ${route()}${env.swagger.route}`);
    // }
  } else {
    log.debug(`Application is up and running.`);
  }
}
