import { Consumer } from '../../consumer';

export interface LoggerContract {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  setScope(scope: string): void;
}

export class CounterConsumer<T> implements Consumer<T> {
  private count = 0;
  constructor(private loggerService: LoggerContract) {}
  consume(objects: T | T[]): void {
    let events = [].concat(objects);
    this.count += events.length;
    this.loggerService.info('Event count: ' + this.count);
  }
}
