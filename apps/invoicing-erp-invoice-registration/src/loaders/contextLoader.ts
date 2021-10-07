/* eslint-disable @nrwl/nx/enforce-module-boundaries */
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
    const loggerBuilder = new LoggerBuilder('Invoicing/Backend', {
      isDevelopment: env.isDevelopment,
      logLevel: env.log.level,
    });

    const repos = buildRepos(db, loggerBuilder);
    const services = await buildServices(repos, loggerBuilder);

    const context: Context = {
      services,
      repos,
      loggerBuilder,
    };

    settings.setData('context', context);
  }
};
