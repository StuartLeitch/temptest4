// import * as path from 'path';
// import * as express from 'express';
// import GraphQLHTTP from 'express-graphql';

const fs = require('fs');
const path = require('path');
import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import { ApolloServer } from 'apollo-server-express';

import session from 'express-session';
import Keycloak from 'keycloak-connect';
import { KeycloakContext, KeycloakTypeDefs, KeycloakSchemaDirectives } from 'keycloak-connect-graphql';

import { env } from '../env';
import { getErrorCode, getErrorMessage } from '../lib/graphql';

// import {Context} from '../context';
import { typeDefs } from '../graphql/schema';
import { resolvers } from '../graphql/resolvers';

export const graphqlLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings && env.graphql.enabled) {

    const context = settings.getData('context');
    const expressApp = settings.getData('express_app');
    const { keycloak } = configureKeycloak(expressApp, env.graphql.route)

    // expressApp.use(env.graphql.route, keycloak.protect());

    const graphqlServer = new ApolloServer({
      typeDefs: [KeycloakTypeDefs, typeDefs], // 1. Add the Keycloak Type Defs
      schemaDirectives: KeycloakSchemaDirectives, // 2. Add the KeycloakSchemaDirectives
      resolvers,
      context: ({ req }) => {
        return {
            ...context,
            kauth: new KeycloakContext({ req } as any) // 3. add the KeycloakContext to `kauth`
          }
        },
      playground: env.graphql.editor,
      // formatError: (error) => {
      //   return ({
      //     code: getErrorCode(error.message),
      //     message: getErrorMessage(error.message),
      //     path: error.path,
      //   })
      // },
    });

    // Add graphql layer to the express app
    graphqlServer.applyMiddleware({
      app: expressApp,
      path: env.graphql.route,
    });
  }
};

function configureKeycloak(app, graphqlPath) {
  const keycloakConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, './keycloak.json')))
  const memoryStore = new session.MemoryStore()

  app.use(session({
    secret: process.env.SESSION_SECRET_STRING || 'th1s 5h0u1d b3 a we11-h1dden s3cr3t',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
  }))

  const keycloak = new Keycloak({
    store: memoryStore
  }, keycloakConfig)

  // // Install general keycloak middleware
  // app.use(keycloak.middleware({
  //   admin: graphqlPath
  // }))

  // Protect the main route for all graphql services
  // Disable unauthenticated access
  app.use(graphqlPath, keycloak.middleware())

  return { keycloak }
}
