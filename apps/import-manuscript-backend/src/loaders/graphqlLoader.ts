import { ApolloServer } from 'apollo-server-express';
import Keycloak from 'keycloak-connect';
import session from 'express-session';
import {
  KeycloakSchemaDirectives,
  KeycloakTypeDefs,
  KeycloakContext,
} from 'keycloak-connect-graphql';
import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { resolvers } from '../graphql/resolvers';
import { typeDefs } from '../graphql/schema';

import { env } from '../env';
import {createPrometheusExporterPlugin} from "@bmatei/apollo-prometheus-exporter";
import { register } from 'prom-client'
import {prometheusPlugin} from "@talabes/apollo-prometheus-plugin";

export const graphqlLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings && env.graphql.enabled) {
    const context = settings.getData('context');
    const expressApp = settings.getData('express_app');

    const memoryStore = new session.MemoryStore();

    expressApp.use(
      session({
        secret: env.app.sessionSecret,
        resave: false,
        saveUninitialized: true,
        store: memoryStore,
      })
    );

    const { keycloak } = configureKeycloak(
      expressApp,
      memoryStore,
      env.graphql.route
    );

    const apolloPrometheusPlugin = prometheusPlugin(register, { enableNodeMetrics: false});
    const prometheusExporterPlugin = createPrometheusExporterPlugin({ app: expressApp, hostnameLabel: false });

    const graphqlServer = new ApolloServer({
      typeDefs: [KeycloakTypeDefs, typeDefs], // 1. Add the Keycloak Type Defs
      schemaDirectives: KeycloakSchemaDirectives, // 2. Add the KeycloakSchemaDirectives
      resolvers,
      plugins: [apolloPrometheusPlugin, prometheusExporterPlugin],
      tracing: true,
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
