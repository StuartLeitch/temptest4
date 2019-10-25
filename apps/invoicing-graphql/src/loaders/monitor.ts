import basicAuth from 'express-basic-auth';
import monitor from 'express-status-monitor';
import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';

import {environment} from '../environments/environment';

export const monitorLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings && environment.monitor.enabled) {
    const expressApp = settings.getData('express_app');

    expressApp.use(monitor());
    expressApp.get(
      environment.monitor.route,
      environment.monitor.username
        ? basicAuth({
            users: {
              [`${environment.monitor.username}`]: environment.monitor.password
            },
            challenge: true
          })
        : (req, res, next) => next(),
      monitor().pageRoute
    );
  }
};
