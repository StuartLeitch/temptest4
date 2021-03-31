import { Consumer } from '../../consumer';

interface UseCase<IRequest, IResponse, IContext = any> {
  execute(
    request?: IRequest,
    context?: IContext
  ): Promise<IResponse> | IResponse;
}

export class UsecasePublishConsumer<T> implements Consumer<T> {
  private TOTAL_LIMIT_PER_TABLE = 100;

  constructor(private consumeEventsUsecase: UseCase<T[], unknown, unknown>, private mapCount) {}
  async consume(objects: T | T[]): Promise<void> {
    const events = [].concat(objects);
    await this.consumeEventsUsecase.execute(events, {
      totalLimitPerTable: this.TOTAL_LIMIT_PER_TABLE,
      mapCount: this.mapCount
    });
  }

  setTotalLimitPerTable(total: number) {
    this.TOTAL_LIMIT_PER_TABLE = total;
  }
}
