import * as express from 'express';
import GraphQLHTTP from 'express-graphql';
import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import { ApolloServer } from 'apollo-server-express';
import * as path from 'path';

import { env } from '../env';
import { getErrorCode, getErrorMessage, handlingErrors } from '../lib/graphql';

// import {Context} from '../context';
import { typeDefs } from '../graphql/schema';
import { resolvers } from '../graphql/resolvers';

export const graphqlLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings && env.graphql.enabled) {
    const context = settings.getData('context');
    const expressApp = settings.getData('express_app');

    const graphqlServer = new ApolloServer({
      typeDefs,
      resolvers,
      context: () => context,
      playground: env.graphql.editor,
      formatError: error => ({
        code: getErrorCode(error.message),
        message: getErrorMessage(error.message),
        path: error.path
      })
    });

    // Add graphql layer to the express app
    graphqlServer.applyMiddleware({
      app: expressApp,
      path: env.graphql.route
    });
  }
};
