import { Consumer } from '../../consumer';
import { UseCase } from 'libs/shared/src/lib/core/domain/UseCase';

export class UsecasePublishConsumer<T> implements Consumer<T> {
  constructor(private consumeEventsUsecase: UseCase<T[], unknown, unknown>) {}
  async consume(objects: T | T[]): Promise<void> {
    const events = [].concat(objects);
    await this.consumeEventsUsecase.execute(events);
  }
}
