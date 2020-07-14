import { Consumer } from '../../consumer';
import { LoggerContract } from 'libs/shared/src/lib/infrastructure/logging/Logger';

export class CounterConsumer<T> implements Consumer<T> {
  private count = 0;
  constructor(private loggerService: LoggerContract) {}
  consume(objects: T | T[]): void {
    let events = [].concat(objects);
    this.count += events.length;
    this.loggerService.info('Event count: ' + this.count);
  }
}
