import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceIdRequiredError extends UseCaseError {
  constructor() {
    super('Invoice id is required');
  }
}

export class InvoiceHasNoManuscript extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Invoice with id {${invoiceId}} has no manuscript`);
  }
}
