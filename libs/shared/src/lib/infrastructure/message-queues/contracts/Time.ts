export enum SchedulingTime {
  Millisecond = 1,
  Second = 1000 * Millisecond,
  Minute = 60 * Second,
  Hour = 60 * Minute,
  Day = 24 * Hour
}

export enum TimerType {
  DelayedTimer = 'DelayedTimer',
  RepeatableTimer = 'RepeatableTimer',
  CronRepeatableTimer = 'CronRepeatableTimer'
}

interface ITimer {
  kind: TimerType;
}

export interface DelayedTimer extends ITimer {
  kind: TimerType.DelayedTimer;
  delay: SchedulingTime;
}

export function delayedTimer(
  count: number,
  baseValue: SchedulingTime
): DelayedTimer {
  return {
    kind: TimerType.DelayedTimer,
    delay: count * baseValue
  };
}

export interface RepeatableTimer extends ITimer {
  kind: TimerType.RepeatableTimer;
  every: SchedulingTime;
}

export function repeatableTimer(
  count: number,
  baseValue: SchedulingTime
): RepeatableTimer {
  return {
    kind: TimerType.RepeatableTimer,
    every: count * baseValue
  };
}

export interface CronRepeatableTimer extends ITimer {
  kind: TimerType.CronRepeatableTimer;
  cron: string;
  description: string;
}

export function cronRepeatableTimer(
  cron: string,
  description: string
): CronRepeatableTimer {
  return {
    kind: TimerType.CronRepeatableTimer,
    description,
    cron
  };
}

export type ScheduleTimer =
  | DelayedTimer
  | RepeatableTimer
  | CronRepeatableTimer;
