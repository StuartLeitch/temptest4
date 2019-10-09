import {DatabaseAdapterConfigContract} from './databaseAdapterConfig';

export interface DatabaseAdapterInfo<T extends DatabaseAdapterConfigContract> {
  type: string;
  config: T;
}
