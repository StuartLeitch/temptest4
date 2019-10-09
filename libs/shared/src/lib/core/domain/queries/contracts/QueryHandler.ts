import {QueryContract} from './Query';

export interface QueryHandlerContract<
  T extends QueryContract = any,
  TRes = any
> {
  execute(query: T): Promise<TRes>;
}
