import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

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

export class InvoiceAlreadyConfirmedError extends Result<UseCaseError> {
  constructor(refNumber: string) {
    super(false, {
      message: `Invoice with reference number ${refNumber} cannot be confirmed a second time.`,
    });
  }
}

export class ManuscriptNotAcceptedError extends Result<UseCaseError> {
  constructor(invoiceId: string) {
    super(false, {
      message: `Invoice with id ${invoiceId} cannot be confirmed because manuscript is not accepted.`,
    });
  }
}

export class TransactionNotFoundError extends Result<UseCaseError> {
  constructor(transactionId: string, error: Error) {
    const additionalMessage = error ? ' ' + error : '';
    super(false, {
      message:
        `Transaction with id ${transactionId} not found.` + additionalMessage,
    });
  }
}
