import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class CustomIdRequiredError extends UseCaseError {
  constructor() {
    super(`Manuscript custom id is required`);
  }
}

export class TransactionNotFoundError extends UseCaseError {
  constructor(id: string) {
    super(`No transaction found with id {${id}}`);
  }
}
