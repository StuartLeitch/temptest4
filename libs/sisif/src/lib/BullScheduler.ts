import Redis from 'ioredis';
import Queue from 'bull';

import { LoggerContract } from '@hindawi/shared';

import {
  SchedulerContract,
  ListenerContract,
  ScheduleTimer,
  Job,
} from './Types';

import { TimerMap } from './utils';

interface RedisCredentials {
  password?: string;
  port?: number;
  host: string;
}

type ConnectionPool = {
  default: () => Redis.Redis;
  subscriber: Redis.Redis;
  client: Redis.Redis;
};

export class BullScheduler implements SchedulerContract, ListenerContract {
  private connections: ConnectionPool;

  constructor(
    private redisConnection: RedisCredentials,
    private loggerService: LoggerContract
  ) {
    this.getRedisConnection = this.getRedisConnection.bind(this);
    this.connections = {
      default: () => new Redis(this.redisConnection),
      subscriber: new Redis(this.redisConnection),
      client: new Redis(this.redisConnection),
    };
  }

  public async schedule(
    job: Job,
    queueName: string,
    timer: ScheduleTimer
  ): Promise<void> {
    const queue = this.createQueue(queueName);
    try {
      const options = TimerMap.get(timer.kind)(job.id, timer);
      await queue.add(job, options);
      this.loggerService.debug(`Queueing on ${queueName} job ${job}`);
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
      await this.createQueue(queueName).process((job) => callback(job.data));
      this.loggerService.debug(`Started listening on ${queueName}`);
    } catch (e) {
      this.loggerService.error(
        `Listening on que ${queueName} got error ${e.message}`
      );
      throw e;
    }
  }

  private createQueue(queueName: string, options = {}): Queue.Queue {
    return new Queue(queueName, {
      createClient: this.getRedisConnection,
      limiter: {
        duration: 5000,
        max: 1000,
      },
    });
  }

  /**
   * To avoid making too many connections, the existing ones are reused.
   *
   * @param type connection type
   */
  private getRedisConnection(type: string): Redis.Redis {
    return this.connections[type] || this.connections.default();
  }
}
