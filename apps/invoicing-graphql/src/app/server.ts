import {ApolloServer} from 'apollo-server';

import {ContextCreator} from './context';
import {typeDefs} from './schema';
// import {resolvers} from '../api/resolvers';

export function makeServer(context: ContextCreator): ApolloServer {
  return new ApolloServer({
    typeDefs,
    // resolvers,
    context
  });
}
