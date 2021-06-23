import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find an Invoice with Invoice id {${invoiceId}}.`);
  }
}

export class InvoiceNumberAssignationError extends UseCaseError {
  constructor(invoiceId: string, err: Error) {
    super(
      `When assigning an invoice number to invoice with id ${invoiceId} an error ocurred: ${err.message}, with stack: ${err.stack}`
    );
  }
}

export class InvoiceAlreadyConfirmedError extends UseCaseError {
  constructor(refNumber: string) {
    super(
      `Invoice with reference number ${refNumber} cannot be confirmed a second time.`
    );
  }
}

export class ManuscriptNotAcceptedError extends UseCaseError {
  constructor(invoiceId: string) {
    super(
      `Invoice with id ${invoiceId} cannot be confirmed because manuscript is not accepted.`
    );
  }
}

export class TransactionNotFoundError extends UseCaseError {
  constructor(transactionId: string, error: Error) {
    const additionalMessage = error ? ' ' + error : '';
    super(
      `Transaction with id ${transactionId} not found.` + additionalMessage
    );
  }
}
