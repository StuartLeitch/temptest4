import {connection} from '@hindawi/shared';

import {makeContext} from './context';
import {makeServer} from './server';

const db = connection();
const context = makeContext(db);
const server = makeServer(context);

server.listen().then(({url}) => {
  console.log(`🚀 Server ready at ${url}`);
});
