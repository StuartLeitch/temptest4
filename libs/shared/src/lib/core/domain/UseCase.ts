export type BaseContext = Record<string, unknown>;

export interface UseCase<IRequest, IResponse, IContext = BaseContext> {
  execute(
    request?: IRequest,
    context?: IContext
  ): Promise<IResponse> | IResponse;
}
