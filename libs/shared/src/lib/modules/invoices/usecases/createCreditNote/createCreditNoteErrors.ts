/* eslint-disable @typescript-eslint/no-namespace */
import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class TransactionNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find a Transaction for {${invoiceId}}.`);
  }
}
export class InvoiceNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find a Invoice for {${invoiceId}}.`);
  }
}

export class InvoiceIsDraftError extends UseCaseError {
  constructor(invoiceId: string) {
    super(
      `Invoice with id {${invoiceId}} is still in "DRAFT" status and cannot have a credit note created`
    );
  }
}
