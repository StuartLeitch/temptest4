import {ApolloServer} from 'apollo-server-express';
import express from 'express';

import {ContextCreator} from './context';
import {typeDefs} from './schema';
import {resolvers} from './resolvers';

const app = express();

app.get('/api/test', (req, res) => res.status(200).send('asdf'));


export function makeServer(context: ContextCreator): ApolloServer {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context
  });
}
