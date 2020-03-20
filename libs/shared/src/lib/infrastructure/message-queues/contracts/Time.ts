export enum SchedulingTime {
  Millisecond = 1,
  Second = 1000 * Millisecond,
  Minute = 60 * Second,
  Hour = 60 * Minute,
  Day = 24 * Hour
}

export enum TimerType {
  CronRepeatableTimer = 'CronRepeatableTimer',
  RepeatableTimer = 'RepeatableTimer',
  DelayedTimer = 'DelayedTimer'
}

interface EmptyTimer {
  kind: TimerType;
}

export interface DelayedTimer extends EmptyTimer {
  kind: TimerType.DelayedTimer;
  delay: SchedulingTime;
}

export interface RepeatableTimer extends EmptyTimer {
  kind: TimerType.RepeatableTimer;
  every: SchedulingTime;
}

export interface CronRepeatableTimer extends EmptyTimer {
  kind: TimerType.CronRepeatableTimer;
  description: string;
  cron: string;
}

export type ScheduleTimer =
  | CronRepeatableTimer
  | RepeatableTimer
  | DelayedTimer;

export class TimerBuilder {
  static delayed(count: number, baseValue: SchedulingTime): DelayedTimer {
    return {
      kind: TimerType.DelayedTimer,
      delay: count * baseValue
    };
  }

  static every(count: number, baseValue: SchedulingTime): RepeatableTimer {
    return {
      kind: TimerType.RepeatableTimer,
      every: count * baseValue
    };
  }

  static everyCron(cron: string, description: string): CronRepeatableTimer {
    return {
      kind: TimerType.CronRepeatableTimer,
      description,
      cron
    };
  }
}
