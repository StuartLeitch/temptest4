import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { LoggerBuilder, LogLevel } from '@hindawi/shared';

import { buildServices, Context } from '../builders';
import { env } from '../env';

export const contextLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const loggerBuilder = new LoggerBuilder(LogLevel[env.log.level]);

    const services = await buildServices(loggerBuilder);

    const context: Context = {
      services,
      loggerBuilder,
    };

    settings.setData('context', context);
  }
};
