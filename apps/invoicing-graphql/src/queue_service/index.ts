const logger = require('@pubsweet/logger');
const {createQueueService} = require('@hindawi/queue-service');
const config = require('config');

const events = {};

export const queueService = createQueueService()
  .then((messageQueue: any) => {
    Object.keys(events).forEach((handler, event) =>
      messageQueue.registerEventHandler({event, handler})
    );
    return messageQueue;
  })
  .catch((err: any) => {
    logger.error('FATAL ERROR, SHUTTING DOWN:', err);
    process.exit(1);
  });
