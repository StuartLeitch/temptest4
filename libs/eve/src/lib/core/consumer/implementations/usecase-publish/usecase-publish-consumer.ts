import { Consumer } from '../../consumer';

interface UseCase<IRequest, IResponse, IContext = any> {
  execute(
    request?: IRequest,
    context?: IContext
  ): Promise<IResponse> | IResponse;
}

export class UsecasePublishConsumer<T> implements Consumer<T> {
  constructor(private consumeEventsUsecase: UseCase<T[], unknown, unknown>) {}
  async consume(objects: T | T[]): Promise<void> {
    const events = [].concat(objects);
    await this.consumeEventsUsecase.execute(events);
  }
}
