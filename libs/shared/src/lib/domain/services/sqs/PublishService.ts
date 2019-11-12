import {AbstractSQSClient} from './abstractSqsClient';
import {SQSPublishServiceContract} from '../SQSPublishService';

/**
 * @extends AbstractSQSClient
 */

export class SQSPublishService extends AbstractSQSClient
  implements SQSPublishServiceContract {
  constructor(sqsClient: any) {
    super(sqsClient);
  }
}
