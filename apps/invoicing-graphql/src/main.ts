// import {KnexDB} from '@hindawi/shared';

// import {makeContext} from './app/context';
// import {makeServer} from './app/server';

// const db = KnexDB();
// const context = makeContext(db);
// const server = makeServer(context);

// server.listen().then(({url}) => {
//   console.log(`🚀 Server ready at ${url}`);
// });

import 'reflect-metadata';

import {bootstrapMicroframework} from 'microframework-w3tec';

import {banner} from './lib/banner';
import {Logger} from './lib/logger';
import {winstonLoader} from './loaders/winston';
import {expressLoader} from './loaders/express';
import {iocLoader} from './loaders/ioc';
// import {graphqlLoader} from './loaders/graphql';
import {swaggerLoader} from './loaders/swagger';
import {publicLoader} from './loaders/public';
import {monitorLoader} from './loaders/monitor';
import {homeLoader} from './loaders/home';
import {knexLoader} from './loaders/knex';

/**
 * EXPRESS TYPESCRIPT BOILERPLATE
 * ----------------------------------------
 *
 * This is a boilerplate for Node.js Application written in TypeScript.
 * The basic layer of this app is express. For further information visit
 * the 'README.md' file.
 */
const log = new Logger(__filename);

bootstrapMicroframework({
  /**
   * Loader is a place where you can configure all your modules during microframework
   * bootstrap process. All loaders are executed one by one in a sequential order.
   */
  loaders: [
    winstonLoader,
    iocLoader,
    // eventDispatchLoader,
    knexLoader,
    expressLoader,
    swaggerLoader,
    monitorLoader,
    homeLoader,
    publicLoader
    // graphqlLoader
  ]
})
  .then(() => banner(log))
  .catch(error => log.error('💥 Application is crashed: ' + error));
