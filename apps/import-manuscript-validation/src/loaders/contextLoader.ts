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
    const loggerBuilder = new LoggerBuilder('Import/Manuscript/Validation', {
      isDevelopment: env.isDevelopment,
      logLevel: env.log.level,
    });

    const services = await buildServices(env);

    const context: Context = {
      services,
      loggerBuilder,
    };

    settings.setData('context', context);
  }
};
