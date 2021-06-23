import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class NoApcForInvoice extends UseCaseError {
  constructor(invoiceId: string) {
    super(`No APC found for invoice with id {${invoiceId}}`);
  }
}

export class InvalidInvoiceId extends UseCaseError {
  constructor(invoiceId: string) {
    super(`The invoice id {${invoiceId}} is invalid`);
  }
}

export class ApcHasNoManuscript extends UseCaseError {
  constructor(apcId: string, invoiceId: string) {
    super(
      `The APC with id {${apcId}} from invoice with id {${invoiceId}} has no manuscript tied to it`
    );
  }
}
