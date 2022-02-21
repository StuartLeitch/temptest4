import { KeycloakContext } from 'keycloak-connect-graphql';

import { LoggerBuilderContract } from '@hindawi/shared';

import { Services } from './services';

export interface Context {
  loggerBuilder: LoggerBuilderContract;
  keycloakAuth: KeycloakContext;
  services: Services;
}

export * from './services';
