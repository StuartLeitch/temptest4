import {createQueueService} from '@hindawi/queue-service';

import {environment} from '@env/environment';

const {AWS_SNS_SQS_REGION, AWS_SNS_ENDPOINT, AWS_SNS_TOPIC} = environment;

const region = AWS_SNS_SQS_REGION || process.env.AWS_SNS_SQS_REGION;
const endpoint = AWS_SNS_ENDPOINT || process.env.AWS_SNS_ENDPOINT;
const topic = AWS_SNS_TOPIC || process.env.AWS_SNS_TOPIC;

const sqsConnection = createQueueService(); // creates a new client

export {sqsConnection};
