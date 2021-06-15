import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class FilteringInvoicesDbError extends UseCaseError {
  constructor(err: Error) {
    super(
      `While filtering invoices the db encountered an error: ${err.message}: ${err.stack}`
    );
  }
}
