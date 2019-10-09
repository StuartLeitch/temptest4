import {BaseMockScheduler} from '../../../../../core/tests/mocks/BaseMockScheduler';
import {SchedulerContract} from '../contracts/SchedulerContract';

export class MockScheduler extends BaseMockScheduler
  implements SchedulerContract {
  constructor() {
    super();
  }

  public async schedule(job: any): Promise<void> {
    console.log(`"${job.action}" was scheduled in ${job.timeout} days!`);
  }
}
