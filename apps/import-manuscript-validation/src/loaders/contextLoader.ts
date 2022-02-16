import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { LoggerBuilder } from '@hindawi/shared';

import { buildServices, Context } from '../builders';
import { env } from '../env';

export const contextLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const loggerBuilder = new LoggerBuilder('Import/Manuscript/Backend', {
      isDevelopment: env.isDevelopment,
      logLevel: env.log.level,
    });

    const services = await buildServices(loggerBuilder);

    const context: Context = {
      services,
      loggerBuilder,
      keycloakAuth: null,
    };

    settings.setData('context', context);
  }
};
