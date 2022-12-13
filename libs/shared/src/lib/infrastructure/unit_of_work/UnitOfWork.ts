export type WorkFunction<Repos> = (repos: Repos) => Promise<void> | void;

export enum TransactionType {
  ReadUncommitted = 'read uncommitted',
  RepeatableRead = 'repeatable read',
  ReadCommitted = 'read committed',
  Serializable = 'serializable',
}

export type WorkOptions =
  | {
      transactionType: TransactionType.Serializable;
      serializableRetryCount: number;
    }
  | { transactionType: Omit<TransactionType, TransactionType.Serializable> };

export interface UnitOfWork<Repos> {
  start(options?: WorkOptions): Promise<void>;
  work(workFunction: WorkFunction<Repos>): Promise<void>;
}
