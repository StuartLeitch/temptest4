import clear from 'clear';

import {environment} from '../environments/environment';
import {LoggerContract} from './logger/Logger';

export function banner(log: LoggerContract): void {
  // clear();
  if (environment.app.banner) {
    const route = () =>
      `${environment.app.schema}://${environment.app.host}:${environment.app.port}`;
    log.info(``);
    log.info(
      `Hi, your app is ready on ${route()}${environment.app.routePrefix}`
    );
    log.info(`To shut it down, press <CTRL> + C at any time.`);
    log.info(``);
    log.info('-------------------------------------------------------');
    log.info(`environment  : ${environment.node}`);
    log.info(`Version      : ${environment.app.version}`);
    log.info(``);
    log.info(`API Info     : ${route()}${environment.app.routePrefix}`);
    if (environment.graphql.enabled) {
      log.info(`GraphQL      : ${route()}${environment.graphql.route}`);
    }
    if (environment.swagger.enabled) {
      log.info(`Swagger      : ${route()}${environment.swagger.route}`);
    }
    if (environment.monitor.enabled) {
      log.info(`Monitor      : ${route()}${environment.monitor.route}`);
    }
    log.info('-------------------------------------------------------');
    log.info('');
  } else {
    log.info(`Application is up and running.`);
  }
}
