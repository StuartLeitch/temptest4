import {ApolloServer} from 'apollo-server-express';

import {Context} from '../context';
import {typeDefs} from './schema';
import {resolvers} from './resolvers';


export function makeServer(context: Context): ApolloServer {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: () => context
  });
}
