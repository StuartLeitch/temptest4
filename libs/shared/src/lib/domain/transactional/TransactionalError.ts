const TRANSACTIONAL_ERROR = 'TransactionalError';

export class TransactionalError extends Error {
  public name = TRANSACTIONAL_ERROR;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, TransactionalError.prototype);
  }
}
