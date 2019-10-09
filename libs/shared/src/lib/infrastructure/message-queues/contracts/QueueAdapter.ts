import {Job} from './Job';

export interface QueueAdapterContract {
  consume(queueName: string, callback: (job: Job) => void): Promise<void>;
  produce(queueName: string, payload: any): Promise<void>;
}
