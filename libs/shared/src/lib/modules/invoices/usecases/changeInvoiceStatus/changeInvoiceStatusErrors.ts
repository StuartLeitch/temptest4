import {Result} from '../../../../core/logic/Result';
import {UseCaseError} from '../../../../core/logic/UseCaseError';

export namespace ChangeInvoiceStatusErrors {
  export class InvoiceNotFoundError extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `Can't find invoice with id ${invoiceId}.`
      } as UseCaseError);
    }
  }

  export class ChangeStatusError extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `Couldn't update invoice with id ${invoiceId}.`
      } as UseCaseError);
    }
  }
}
