import { SQS } from 'aws-sdk';
import { Consumer } from '../../consumer';
export declare class SqsPublishConsumer<T> implements Consumer<T> {
    private queueName;
    private sqs;
    constructor(sqs: SQS, queueName: string);
    consume(inputEventOrEvents: T[] | T): Promise<void>;
    private getQueueUrl;
    private sendMessage;
}
