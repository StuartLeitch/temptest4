// require('dotenv').config();

import {makeDb} from './services/knex';

import {makeConfig} from './config';
import {makeContext} from './context';
import {makeGraphqlServer} from './graphql';
import {makeExpressServer} from './api';

import {queueService} from './queue_service';

async function main() {
  const config = await makeConfig();
  const db = await makeDb(config);
  const context = makeContext(config, db);

  const graphqlServer = makeGraphqlServer(context);
  const expressServer = makeExpressServer(context);

  graphqlServer.applyMiddleware({
    app: expressServer,
    path: '/graphql'
  });

  queueService.start();
  (global as any).applicationEventBus = queueService;

  expressServer.listen(process.env.PORT || 4000);
}

main().catch(err => {
  console.log('Unexpected error');
  console.error(err);
  process.exit(1);
});
