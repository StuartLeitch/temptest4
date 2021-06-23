import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Could not find an Invoice with Invoice id {${invoiceId}}.`);
  }
}

export class InvoiceHasNoItems extends UseCaseError {
  constructor(invoiceItemId: string) {
    super(
      `The Invoice with Invoice id {${invoiceItemId}} has no Invoice Items.`
    );
  }
}

export class IncorrectInvoiceIdError extends UseCaseError {
  constructor(id: string, message: string) {
    super(`The invoice id ${id} does not respect guards: ${message}`);
  }
}
