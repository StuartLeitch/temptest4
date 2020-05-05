import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export class InvoiceNotFoundError extends Result<UseCaseError> {
  constructor(id: string) {
    super(false, {
      message: `Invoice with id {${id}} not found.`,
    });
  }
}

export class InvoiceIdRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Invoice id is required.`,
    });
  }
}

export class NoPaymentFoundError extends Result<UseCaseError> {
  constructor(id: string) {
    super(false, {
      message: `No payment found for the invoice with id {${id}}.`,
    });
  }
}

export class PaymentInfoDbError extends Result<UseCaseError> {
  constructor(id: string, err: Error) {
    super(false, {
      message: `While retrieving the payment info for invoice with id {${id}} an error ocurred {${err.message}}: ${err.stack}`,
    });
  }
}
