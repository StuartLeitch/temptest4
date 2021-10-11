const { Producer } = require('sqs-producer');
import { v4 as uuidv4 } from 'uuid';

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
