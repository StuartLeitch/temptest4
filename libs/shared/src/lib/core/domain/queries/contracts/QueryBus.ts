import {QueryContract} from './Query';

export interface QueryBusContract {
  execute<T extends QueryContract, TRes>(query: T): Promise<TRes>;
}
