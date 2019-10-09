import {DatabaseAdapterConfigContract} from './databaseAdapterConfig';

export interface IDatabaseAdapterInfo<T extends DatabaseAdapterConfigContract> {
  type: string;
  config: T;
}
