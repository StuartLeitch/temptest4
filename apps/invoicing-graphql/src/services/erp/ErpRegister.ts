const { Producer } = require('sqs-producer');
import { v4 as uuidv4 } from 'uuid';

// // create custom producer (supporting all opts as per the API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#constructor-property)
// const producer = Producer.create({
//   region: 'eu-west-1',
//   queueUrl: 'https://sqs.eu-west-1.amazonaws.com/916437579680/invoice-registration',
//   accessKeyId: 'AKIA5KX7PW6QKZ5FZWOJ',
//   secretAccessKey: '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'
// });

// // send messages to the queue
// (async() => {
//   await producer.send({
//     'id': 'id1',
//     'body': JSON.stringify({'foo': 'bar'})
//   });
// })();

import { env } from '../../env';

export class ErpRegister {
  private producer;

  constructor() {
    this.producer = Producer.create({
      region: env.aws.sns.sqsRegion,
      queueUrl: env.aws.sqs.erpRegistrationQueue,
      accessKeyId: env.aws.sns.sqsAccessKey,
      secretAccessKey: env.aws.sns.sqsSecretKey,
    });
  }

  async publish(data) {
    const req = {
      'id' : uuidv4(),
      'body': data
    }

    await this.producer.send(req);
  }
}
