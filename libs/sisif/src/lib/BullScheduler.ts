import Queue from 'bull';
import Redis from 'ioredis';

import { SchedulerContract, Job, ScheduleTimer, TimerType } from './Types';

export class BullScheduler implements SchedulerContract {
  private client: Redis.Redis;
  private subscriber: Redis.Redis;

  constructor(private redisConnectionString: string) {
    this.client = new Redis(this.redisConnectionString);
    this.subscriber = new Redis(this.redisConnectionString);
    this.getRedisConnection = this.getRedisConnection.bind(this);
  }

  public async schedule(
    job: Job,
    queueName: string,
    timer: ScheduleTimer
  ): Promise<any> {
    // TODO add logging
    let queue = this.createQueue(queueName);
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
    callback: Queue.ProcessCallbackFunction<T>
  ): void {
    this.createQueue(queueName).process(callback);
  }

  private createQueue(queueName: string, options = {}): Queue.Queue {
    return new Queue(queueName);
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
        return new Redis(this.redisConnectionString);
    }
  }
}
