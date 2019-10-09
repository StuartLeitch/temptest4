import {Scheduler} from '../../../../../infrastructure/scheduler/Scheduler';

export interface SchedulerContract extends Scheduler {
  schedule(job: any): Promise<void>;
}
