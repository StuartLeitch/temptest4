import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceIdNotFoundError extends UseCaseError {
  constructor(customId: string) {
    super(`Couldn't find Invoice for Manuscript with custom id = ${customId}`);
  }
}
export class ManuscriptNotFoundError extends UseCaseError {
  constructor(manuscriptId: string) {
    super(`Couldn't find Manuscript for id = {${manuscriptId}}.`);
  }
}

export class InvoiceItemNotFoundError extends UseCaseError {
  constructor(manuscriptId: string) {
    super(
      `Couldn't find an Invoice Item for Manuscript id = {${manuscriptId}}.`
    );
  }
}

export class InvoiceNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find an Invoice with the Id =  {${invoiceId}}.`);
  }
}

export class TransactionNotFoundError extends UseCaseError {
  constructor(customId: string) {
    super(
      `Couldn't find a Transaction for Manuscript with Custom id = {${customId}}.`
    );
  }
}

export class TransactionRestoreError extends UseCaseError {
  constructor(errorMsg: string) {
    super(`Error restoring Transaction: ${errorMsg}`);
  }
}

export class InvoiceRestoreError extends UseCaseError {
  constructor(errorMsg: string) {
    super(`Error restoring Invoice: ${errorMsg}`);
  }
}

export class InvoiceItemRestoreError extends UseCaseError {
  constructor(errorMsg: string) {
    super(`Error restoring Invoice Item: ${errorMsg}`);
  }
}

export class ManuscriptRestoreError extends UseCaseError {
  constructor(errorMsg: string) {
    super(`Error restoring Manuscript: ${errorMsg}`);
  }
}

export class ManuscriptRequiredError extends UseCaseError {
  constructor() {
    super('Manuscript required');
  }
}
