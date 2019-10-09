import {KnexDB} from '@hindawi/shared';

import {makeContext} from './app/context';
import {makeServer} from './app/server';

const db = KnexDB();
const context = makeContext(db);
const server = makeServer(context);

server.listen().then(({url}) => {
  console.log(`🚀 Server ready at ${url}`);
});
