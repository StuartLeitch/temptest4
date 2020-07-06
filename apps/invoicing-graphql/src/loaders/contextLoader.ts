/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { LoggerBuilder } from '@hindawi/shared';

import { buildServices, buildRepos, Context } from '../builders';

export const contextLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const db = settings.getData('connection');
    const loggerBuilder = new LoggerBuilder();

    const repos = buildRepos(db, loggerBuilder);
    const services = buildServices(repos, loggerBuilder);

    const context: Context = {
      services,
      repos,
      qq: null,
    };

    settings.setData('context', context);
  }
};
