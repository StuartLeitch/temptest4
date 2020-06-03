import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export class FilteringInvoicesDbError extends Result<UseCaseError> {
  constructor(err: Error) {
    super(false, {
      message: `While filtering invoices the db encountered an error: ${err.message}: ${err.stack}`,
    });
  }
}
