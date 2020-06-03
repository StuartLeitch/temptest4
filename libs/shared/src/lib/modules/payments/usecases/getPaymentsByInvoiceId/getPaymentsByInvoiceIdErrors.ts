import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export class InvoiceIdRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `The invoice id is required.`,
    });
  }
}

export class InvoiceNotFoundError extends Result<UseCaseError> {
  constructor(id: string) {
    super(false, {
      message: `Invoice with id {${id}} not found.`,
    });
  }
}

export class RetrievingPaymentsDbError extends Result<UseCaseError> {
  constructor(invoiceId: string, err: Error) {
    super(false, {
      message: `While retrieving the payments for invoice with id {${invoiceId}}, an error ocurred ${err.message}: ${err.stack}`,
    });
  }
}
