import { ApolloServer, gql } from 'apollo-server-express';
import Keycloak from 'keycloak-connect';
import {
  KeycloakSchemaDirectives,
  KeycloakContext,
  KeycloakTypeDefs,
} from 'keycloak-connect-graphql';
import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { resolvers } from '../graphql/resolvers';
import { typeDefs } from '../graphql/schema';
import { validateAndRegisterSchema } from '@phenom.pub/schema-registry-cli/lib/register-schema';

import { env } from '../env';

export const graphqlLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings && env.graphql.enabled) {
    const context = settings.getData('context');
    const expressApp = settings.getData('express_app');

    const keycloak: Keycloak.Keycloak = settings.getData('keycloak');

    const service = {
      name: env.app.name,
      url: env.graphql.serviceUrl,
    };

    await validateAndRegisterSchema(
      service,
      gql`
        ${typeDefs}
      `
    );

    const graphqlServer = new ApolloServer({
      typeDefs: [KeycloakTypeDefs, typeDefs], // 1. Add the Keycloak Type Defs
      schemaDirectives: KeycloakSchemaDirectives, // 2. Add the KeycloakSchemaDirectives
      resolvers,
      context: ({ req }) => {
        return {
          ...context,
          keycloakAuth: new KeycloakContext({ req } as any, keycloak), // 3. add the KeycloakContext to `kAuth`
        };
      },
      playground: env.graphql.editor,
    });

    // Add graphql layer to the express app
    graphqlServer.applyMiddleware({
      app: expressApp,
      path: env.graphql.route,
    });
  }
};

function configureKeycloak(app, memoryStore, graphqlPath) {
  const keycloakConfig = env.app.keycloakConfig;

  const keycloak = new Keycloak(
    {
      store: memoryStore,
    },
    keycloakConfig
  );

  // Protect the main route for all graphql services
  // Disable unauthenticated access
  app.use(graphqlPath, keycloak.middleware());

  return { keycloak };
}
