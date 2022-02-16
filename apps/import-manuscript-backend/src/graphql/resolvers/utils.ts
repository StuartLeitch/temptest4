import { AuthenticationError, ForbiddenError } from 'apollo-server';

import { Roles } from '@hindawi/import-manuscript-commons';
import { UseCaseError, Either } from '@hindawi/shared';

import { Context } from '../../builders';

export function handleForbiddenUsecase(result: Either<UseCaseError, unknown>) {
  if (result && result.isLeft() && result.value.message === 'UNAUTHORIZED') {
    throw new ForbiddenError('You must be authorized');
  }
}

export function getAuthRoles(context: Context): Array<Roles> {
  if (!context.keycloakAuth.accessToken) {
    throw new AuthenticationError('You must be logged in!');
  }

  const authRoles = (context.keycloakAuth.accessToken as any).content
    .resource_access['qa-review'].roles;
  const contextRoles = authRoles.map((role) => Roles[role.toUpperCase()]);

  return contextRoles;
}

export function getOptionalAuthRoles(context: Context): Array<Roles> {
  return getAuthRoles(context);
}
