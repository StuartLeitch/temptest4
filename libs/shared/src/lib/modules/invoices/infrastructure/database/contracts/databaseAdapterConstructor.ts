import {AbstractDatabaseAdapter} from '../databaseAdapter';
import {DatabaseAdapterConfigContract} from './databaseAdapterConfig';

export interface DatabaseAdapterConstructor<T> {
  new <C extends DatabaseAdapterConfigContract = DatabaseAdapterConfigContract>(
    config: C
  ): AbstractDatabaseAdapter<T>;
}
