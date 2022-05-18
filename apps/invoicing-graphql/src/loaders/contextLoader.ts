import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import {
  AuditLoggerServiceProvider,
  LoggerBuilder,
  LogLevel,
} from '@hindawi/shared';

import { buildServices, buildRepos, Context } from '../builders';
import { env } from '../env';

export const contextLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const db = settings.getData('connection');
    const loggerBuilder = new LoggerBuilder(LogLevel[env.log.level]);

    const repos = buildRepos(db, loggerBuilder);
    const services = await buildServices(repos, loggerBuilder);
    const auditLoggerServiceProvider = AuditLoggerServiceProvider.provide(
      repos.audit
    );

    const context: Context = {
      auditLoggerServiceProvider,
      keycloakAuth: null,
      loggerBuilder,
      services,
      repos,
    };

    settings.setData('context', context);
  }
};
