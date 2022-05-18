import { KeycloakContext } from 'keycloak-connect-graphql';

import {
  AuditLoggerServiceContract,
  LoggerBuilderContract,
} from '@hindawi/shared';

import { Services } from './service.builder';
import { Repos } from './repo.builder';

export interface Context {
  auditLoggerServiceProvider: (userData: any) => AuditLoggerServiceContract;
  loggerBuilder: LoggerBuilderContract;
  keycloakAuth: KeycloakContext;
  services: Services;
  repos: Repos;
}

export * from './service.builder';
export * from './repo.builder';
