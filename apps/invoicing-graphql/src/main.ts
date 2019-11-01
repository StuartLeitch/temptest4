import {makeDb} from './services/knex';

import {makeContext} from './graphql/context';
import {makeGraphqlServer} from './graphql';
import {makeExpressServer} from './api';

const db = makeDb();
const context = makeContext(db);

const graphqlServer = makeGraphqlServer(context);
const expressServer = makeExpressServer();

graphqlServer.applyMiddleware({
  app: expressServer,
  path: '/graphql',
});

expressServer.listen(process.env.PORT || 4000);
