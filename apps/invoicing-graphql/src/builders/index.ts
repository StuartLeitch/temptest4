import { KeycloakContext } from 'keycloak-connect-graphql';

import { LoggerBuilderContract, AuditLoggerServiceContract } from '@hindawi/shared';

import { Services } from './service.builder';
import { Repos } from './repo.builder';

export interface Context {
  loggerBuilder: LoggerBuilderContract;
  auditLoggerService: AuditLoggerServiceContract;
  keycloakAuth: KeycloakContext;
  services: Services;
  repos: Repos;
}

export * from './service.builder';
export * from './repo.builder';
