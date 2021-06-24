import path from 'path';
import fs from 'fs';

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
    const { keycloak } = configureKeycloak(expressApp, env.graphql.route);

    // expressApp.use(env.graphql.route, keycloak.protect());

    const graphqlServer = new ApolloServer({
      typeDefs: [KeycloakTypeDefs, typeDefs], // 1. Add the Keycloak Type Defs
      schemaDirectives: KeycloakSchemaDirectives, // 2. Add the KeycloakSchemaDirectives
      resolvers,
      context: ({ req }) => {
        return {
          ...context,
          keycloakAuth: new KeycloakContext({ req } as any), // 3. add the KeycloakContext to `kAuth`
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

function configureKeycloak(app, graphqlPath) {
  const keycloakConfig = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, './keycloak.json')).toString()
  );
  const memoryStore = new session.MemoryStore();

  app.use(
    session({
      secret:
        process.env.SESSION_SECRET_STRING ||
        'th1s 5h0u1d b3 a we11-h1dden s3cr3t',
      resave: false,
      saveUninitialized: true,
      store: memoryStore,
    })
  );

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
