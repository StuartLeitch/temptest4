import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export class InvoiceIdRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Invoice id is required.`,
    });
  }
}

export class PublishInvoiceConfirmError extends Result<UseCaseError> {
  constructor(id: string, err: Error) {
    super(false, {
      message: `When publishing "InvoiceConfirmed" event for invoice with id {${id}} and error ocurred, {${err.message}}: ${err.stack}`,
    });
  }
}

export class PublishInvoicePayedError extends Result<UseCaseError> {
  constructor(id: string, err: Error) {
    super(false, {
      message: `When publishing "InvoicePayed" event for invoice with id {${id}} and error ocurred, {${err.message}}: ${err.stack}`,
    });
  }
}

export class PublishInvoiceFinalizedError extends Result<UseCaseError> {
  constructor(id: string, err: Error) {
    super(false, {
      message: `When publishing "InvoiceFinalized" event for invoice with id {${id}} and error ocurred, {${err.message}}: ${err.stack}`,
    });
  }
}
