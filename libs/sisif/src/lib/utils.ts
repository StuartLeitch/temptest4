import { JobOptions } from 'bull';

import {
  CronRepeatableTimer,
  RepeatableTimer,
  ScheduleTimer,
  DelayedTimer,
  TimerType
} from './Types';

export type TimerMapperFunction = (
  id: string,
  timer: ScheduleTimer
) => JobOptions;

type TimerMapper = {
  [key in TimerType]: TimerMapperFunction;
};

function getDelayOptions(id: string, timer: DelayedTimer): JobOptions {
  return { jobId: id, delay: timer.delay };
}

function getRepeatableOptions(id: string, timer: RepeatableTimer): JobOptions {
  return {
    jobId: id,
    repeat: { every: timer.every }
  };
}

function getCronRepeatableOptions(
  id: string,
  timer: CronRepeatableTimer
): JobOptions {
  return { jobId: id, repeat: { cron: timer.cron } };
}

export const timerMapping: TimerMapper = {
  [TimerType.CronRepeatableTimer]: getCronRepeatableOptions,
  [TimerType.RepeatableTimer]: getRepeatableOptions,
  [TimerType.DelayedTimer]: getDelayOptions
};
