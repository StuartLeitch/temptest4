import Queue from 'bull';
import Redis from 'ioredis';

import { SchedulerContract, Job, ScheduleTimer, TimerType } from './Types';
interface RedisCredentials {
  port?: number;
  host: string;
  password?: string;
}
export class BullScheduler implements SchedulerContract {
  private redisConnection: RedisCredentials;
  private client: Redis.Redis;
  private subscriber: Redis.Redis;

  constructor(redisConnection: RedisCredentials) {
    this.redisConnection = redisConnection;
    this.client = new Redis(this.redisConnection);
    this.subscriber = new Redis(this.redisConnection);
    this.getRedisConnection = this.getRedisConnection.bind(this);
  }

  public async schedule(
    job: Job,
    queueName: string,
    timer: ScheduleTimer
  ): Promise<void> {
    // TODO add logging
    const queue = this.createQueue(queueName);
    try {
      if (timer.kind === TimerType.DelayedTimer) {
        await queue.add(job, {
          jobId: job.id,
          delay: timer.delay
        });
      } else if (timer.kind === TimerType.RepeatableTimer) {
        await queue.add(job, {
          jobId: job.id,
          repeat: { every: timer.every }
        });
      } else if (timer.kind === TimerType.CronRepeatableTimer) {
        await queue.add(job, {
          jobId: job.id,
          repeat: { cron: timer.cron }
        });
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      queue.close();
    }
  }

  removeRepeatable(jobId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  public startListening<T>(
    queueName: string,
    callback: (data: T) => void
  ): void {
    this.createQueue(queueName).process(job => callback(job.data));
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
