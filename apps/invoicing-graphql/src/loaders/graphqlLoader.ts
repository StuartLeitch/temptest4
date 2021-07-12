import { ApolloServer } from 'apollo-server-express';
import Keycloak from 'keycloak-connect';
import session from 'express-session';
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

import { env } from '../env';

export const graphqlLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings && env.graphql.enabled) {
    const context = settings.getData('context');
    const expressApp = settings.getData('express_app');

    const memoryStore = new session.MemoryStore();

    expressApp.use(session({
      secret: 's0m3 s3cr3t',
      resave: false,
      saveUninitialized: true,
      store: memoryStore
    }));

    const { keycloak } = configureKeycloak(expressApp, memoryStore, env.graphql.route);

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
