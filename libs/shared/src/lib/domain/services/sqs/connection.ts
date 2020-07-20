import { createQueueService } from '@hindawi/queue-service';

const sqsConnection = createQueueService(); // creates a new client

export { sqsConnection };
