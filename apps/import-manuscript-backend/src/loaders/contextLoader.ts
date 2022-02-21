import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { LoggerBuilder } from '@hindawi/shared';

import { buildServices, buildRepos, Context } from '../builders';
import { env } from '../env';

export const contextLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const db = settings.getData('connection');
    const loggerBuilder = new LoggerBuilder('Import/Manuscript/Backend', {
      isDevelopment: env.isDevelopment,
      logLevel: env.log.level,
    });

    const repos = buildRepos(db, loggerBuilder);
    const services = await buildServices(repos, loggerBuilder);

    const context: Context = {
      services,
      repos,
      loggerBuilder,
      keycloakAuth: null,
    };

    settings.setData('context', context);

    process.on('unhandledRejection', function (reason, p) {
      //I just caught an unhandled promise rejection, since we already have fallback handler for unhandled errors (see below), let throw and let him handle that
      throw reason;
    });
    process.on('uncaughtException', function (error) {
      //I just received an error that was never handled, time to handle it and then decide whether a restart is needed
      // errorManagement.handler.handleError(error);
      // if (!errorManagement.handler.isTrustedError(error))
      //   process.exit(1);
    });
  }
};
