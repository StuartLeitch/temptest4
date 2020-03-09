import Redis from 'ioredis';
import Queue from 'bull';

import {
  SchedulerContract,
  ScheduleTimer,
  Job,
  ListenerContract
} from './Types';

import { TimerMap } from './utils';

interface RedisCredentials {
  port?: number;
  host: string;
  password?: string;
}
export class BullScheduler implements SchedulerContract, ListenerContract {
  private redisConnection: RedisCredentials;
  private subscriber: Redis.Redis;
  private client: Redis.Redis;
  private loggerService: any;

  constructor(redisConnection: RedisCredentials, loggerService: any) {
    this.redisConnection = redisConnection;
    this.client = new Redis(this.redisConnection);
    this.subscriber = new Redis(this.redisConnection);
    this.getRedisConnection = this.getRedisConnection.bind(this);
    this.loggerService = loggerService;
  }

  public async schedule(
    job: Job,
    queueName: string,
    timer: ScheduleTimer
  ): Promise<void> {
    // TODO add logging
    const queue = this.createQueue(queueName);
    try {
      const options = TimerMap.get(timer.kind)(job.id, timer);
      await queue.add(job, options);
    } catch (error) {
      this.loggerService.error(
        `Scheduling on queue ${queueName} got error ${error.message}`
      );
      throw error;
    } finally {
      queue.close();
    }
  }

  removeRepeatable(jobId: string): Promise<unknown> {
    throw new Error('Method not implemented.');
  }

  public async startListening<T>(
    queueName: string,
    callback: (data: T) => void
  ): Promise<void> {
    try {
      await this.createQueue(queueName).process(job => callback(job.data));
    } catch (e) {
      this.loggerService.error(
        `Listening on que ${queueName} got error ${e.message}`
      );
      throw e;
    }
  }

  private createQueue(queueName: string, options = {}): Queue.Queue {
    return new Queue(queueName, { createClient: this.getRedisConnection });
  }

  /**
   * To avoid making too many connections, the existing ones are reused.
   *
   * @param type connection type
   */
  private getRedisConnection(type: string): Redis.Redis {
    switch (type) {
      case 'client':
        return this.client;
      case 'subscriber':
        return this.subscriber;
      default:
        return new Redis(this.redisConnection);
    }
  }
}
