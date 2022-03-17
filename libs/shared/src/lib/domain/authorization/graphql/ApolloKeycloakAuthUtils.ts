import { AuthenticationError, ForbiddenError } from 'apollo-server';
import { KeycloakContext } from 'keycloak-connect-graphql';
import { Token } from 'keycloak-connect';

import { Either, UseCaseError } from '../../../core/logic';
import { GraphqlAuthUtils } from './AuthUtilsContract';
import { isAuthorizationError } from '../decorators';

type UsecaseResponse = Either<UseCaseError, unknown>;

interface BaseContext {
  keycloakAuth: KeycloakContext;
}

export class ApolloKeycloakAuthUtils<Context extends BaseContext, Roles>
  implements GraphqlAuthUtils<Context, Roles> {
  constructor(
    private readonly clientId: string,
    private readonly applicationRoles: Record<string, Roles>
  ) {}

  handleForbiddenUsecase(result: UsecaseResponse): void | never {
    if (result && result.isLeft() && isAuthorizationError(result.value)) {
      throw new ForbiddenError('You must be authorized');
    }
  }

  getAuthRoles(context: Context): Array<Roles> | never {
    if (!context.keycloakAuth.accessToken) {
      throw new AuthenticationError('You must be logged in!');
    }

    // console.log(this.applicationRoles);
    // console.info((context.keycloakAuth.accessToken as any).content.resource_access);

    if (!(context.keycloakAuth.accessToken as any).content.resource_access[this.clientId]) {
      throw new AuthenticationError('Auth client id is missing!');
    }

    const authRoles: Array<string> = (context.keycloakAuth.accessToken as any)
      .content.resource_access[this.clientId].roles;
    const contextRoles = authRoles.map(
      (role) => this.applicationRoles[role.toUpperCase()]
    );

    return contextRoles;
  }

  getUserEmail(context: Context): string {
    if (!context.keycloakAuth.accessToken) {
      throw new AuthenticationError('You must be logged in!');
    }

    const { content } = context.keycloakAuth.accessToken as any;

    return `${content.name} <${content.username}>`;
  }
}
