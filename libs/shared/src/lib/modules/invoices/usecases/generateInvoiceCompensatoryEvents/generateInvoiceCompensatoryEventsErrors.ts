import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceIdRequiredError extends UseCaseError {
  constructor() {
    super(`Invoice id is required.`);
  }
}

export class PublishInvoiceConfirmError extends UseCaseError {
  constructor(id: string, err: Error) {
    super(
      `When publishing "InvoiceConfirmed" event for invoice with id {${id}} and error ocurred, {${err.message}}: ${err.stack}`
    );
  }
}

export class PublishInvoicePayedError extends UseCaseError {
  constructor(id: string, err: Error) {
    super(
      `When publishing "InvoicePayed" event for invoice with id {${id}} and error ocurred, {${err.message}}: ${err.stack}`
    );
  }
}

export class PublishInvoiceFinalizedError extends UseCaseError {
  constructor(id: string, err: Error) {
    super(
      `When publishing "InvoiceFinalized" event for invoice with id {${id}} and error ocurred, {${err.message}}: ${err.stack}`
    );
  }
}

export class PublishInvoiceCreditedError extends UseCaseError {
  constructor(id: string, err: Error) {
    super(
      `When publishing "InvoiceCredited" event for invoice with id {${id}} and error ocurred, {${err.message}}: ${err.stack}`
    );
  }
}
