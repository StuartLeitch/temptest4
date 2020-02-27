import { Job } from '../message-queues/contracts/Job';
import { ScheduleTimer } from '../message-queues/contracts/Time';

export interface SchedulerContract {
  schedule(job: Job, queue: string, timer: ScheduleTimer): Promise<any>;
  removeRepeatable(jobId: string): Promise<any>;
}
