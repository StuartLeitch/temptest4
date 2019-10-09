export interface Flow<IRequest, IResponse, IContext = any> {
  execute(request?: IRequest, context?: IContext): Promise<IResponse> | IResponse;
}
