import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace ConfirmInvoiceErrors {
  export class InvoiceNotFoundError extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `Couldn't find an Invoice with Invoice id {${invoiceId}}.`,
      });
    }
  }

  export class InvoiceNumberAssignationError extends Result<UseCaseError> {
    constructor(invoiceId: string, err: Error) {
      super(false, {
        message: `When assigning an invoice number to invoice with id ${invoiceId} an error ocurred: ${err.message}, with stack: ${err.stack}`,
      });
    }
  }
}
