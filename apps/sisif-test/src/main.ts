// will be used for testing
import { LoggerBuilder } from '@hindawi/shared';
import { BullScheduler, TimerType, SchedulingTime } from '@hindawi/sisif';
import express from 'express';

const loggerBuilder = new LoggerBuilder();
const logger = loggerBuilder.getLogger();

const schedulingService = new BullScheduler(
  {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD,
  },
  logger
);

const queueName = process.env.QUEUE || 'qq';

if (process.env.PRODUCER) {
  const interval = Number(process.env.INTERVAL) || 10000;
  setInterval(async function () {
    console.log('Sending');
    try {
      await schedulingService.schedule(
        {
          type: 'TEST',
          data: { works: true },
          created: new Date().toISOString(),
        },
        queueName,
        { kind: TimerType.DelayedTimer, delay: 2 * SchedulingTime.Second }
      );
    } catch (error) {
      console.log(error);
    }
  }, interval);
} else {
  schedulingService.startListening(queueName, (job: any) => {
    console.log(job.data);
  });
}

const app = express();

app.get('/', (req, res) => {
  res.json({ ready: true });
});

app.listen(process.env.PORT || '80');
