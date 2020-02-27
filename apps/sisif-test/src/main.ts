// will be used for testing
import { BullScheduler, TimerType, SchedulingTime } from '@hindawi/sisif';

const schedulingService = new BullScheduler('localhost:6379');

const queueName = 'qq';

if (process.env.PRODUCER) {
  (async function() {
    for (let i = 0; i < 1000; i++) {
      console.log('Sending');
      await schedulingService.schedule(
        {
          type: 'TEST',
          data: { works: true },
          created: new Date().toISOString()
        },
        queueName,
        { kind: TimerType.DelayedTimer, delay: 2 * SchedulingTime.Second }
      );
    }
    process.exit(0);
  })();
} else {
  let i = 1;
  schedulingService.startListening(queueName, job => {
    if (i % 10 === 0) {
      console.log(i);
    }
    i++;
  });
  setTimeout(() => {
    process.exit(1);
  }, Number(process.env.TIMEOUT) || 100);
}
