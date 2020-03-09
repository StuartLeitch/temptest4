import { JobOptions } from 'bull';

import {
  CronRepeatableTimer,
  RepeatableTimer,
  ScheduleTimer,
  DelayedTimer,
  TimerType
} from './Types';

type TimerMapper = (id: string, timer: ScheduleTimer) => JobOptions;

type TimerMapRepo = {
  [key in TimerType & 'default']: TimerMapper;
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

function unsupportedTimer(kind: unknown): unknown {
  return () => {
    throw Error(`Unsupported Timer Type {${kind}}`);
  };
}

const timerMapRepo: TimerMapRepo = {
  [TimerType.CronRepeatableTimer]: getCronRepeatableOptions,
  [TimerType.RepeatableTimer]: getRepeatableOptions,
  [TimerType.DelayedTimer]: getDelayOptions,
  default: unsupportedTimer
};

export class TimerMap {
  static get(kind: TimerType): TimerMapper {
    return timerMapRepo[kind] || timerMapRepo['default'](kind);
  }
}
