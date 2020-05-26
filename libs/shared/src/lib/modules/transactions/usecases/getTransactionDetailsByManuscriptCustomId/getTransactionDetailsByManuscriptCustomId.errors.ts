import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export class CustomIdRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Manuscript custom id is required`,
    });
  }
}

export class TransactionNotFoundError extends Result<UseCaseError> {
  constructor(id: string) {
    super(false, {
      message: `No transaction found with id {${id}}`,
    });
  }
}
