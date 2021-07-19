import { bootstrapMicroframework } from 'microframework-w3tec';

import { env } from './env';

import { LoggerBuilder } from '@hindawi/shared';

const log = new LoggerBuilder('loader', {
  logLevel: env.log.level,
  isDevelopment: env.isDevelopment,
}).getLogger();

async function main() {
  const loaders = [];

  if (env.loaders.netsuiteLoader) {
    const { netsuiteLoader } = await import('./loaders/NetsuiteLoader');
    log.info('NetSuite initiated ✔️');
    loaders.push(netsuiteLoader);
  }

  await bootstrapMicroframework(loaders).catch((error) => {
    log.error('Application crashed', error);
    process.exit(1);
  });
}

main();
