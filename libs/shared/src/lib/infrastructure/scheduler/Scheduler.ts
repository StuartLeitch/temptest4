export interface Scheduler {
  schedule(job: any): Promise<void>;
}
