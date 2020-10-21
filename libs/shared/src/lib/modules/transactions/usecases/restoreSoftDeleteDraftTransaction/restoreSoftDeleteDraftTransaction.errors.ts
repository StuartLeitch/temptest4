import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export class InvoiceIdNotFoundError extends Result<UseCaseError> {
  constructor(customId: string) {
    super(false, {
      message: `Couldn't find Invoice for Manuscript with custom id = ${customId}`,
    });
  }
}
export class ManuscriptNotFoundError extends Result<UseCaseError> {
  constructor(manuscriptId: string) {
    super(false, {
      message: `Couldn't find Manuscript for id = {${manuscriptId}}.`,
    });
  }
}

export class InvoiceItemNotFoundError extends Result<UseCaseError> {
  constructor(manuscriptId: string) {
    super(false, {
      message: `Couldn't find an Invoice Item for Manuscript id = {${manuscriptId}}.`,
    });
  }
}

export class InvoiceNotFoundError extends Result<UseCaseError> {
  constructor(invoiceId: string) {
    super(false, {
      message: `Couldn't find an Invoice with the Id =  {${invoiceId}}.`,
    });
  }
}

export class TransactionNotFoundError extends Result<UseCaseError> {
  constructor(customId: string) {
    super(false, {
      message: `Couldn't find a Transaction for Manuscript with Custom id = {${customId}}.`,
    });
  }
}

export class TransactionRestoreError extends Result<UseCaseError> {
  constructor(errorMsg: string) {
    super(false, {
      message: `Error restoring Transaction: ${errorMsg}`,
    });
  }
}

export class InvoiceRestoreError extends Result<UseCaseError> {
  constructor(errorMsg: string) {
    super(false, {
      message: `Error restoring Invoice: ${errorMsg}`,
    });
  }
}

export class InvoiceItemRestoreError extends Result<UseCaseError> {
  constructor(errorMsg: string) {
    super(false, {
      message: `Error restoring Invoice Item: ${errorMsg}`,
    });
  }
}

export class ManuscriptRestoreError extends Result<UseCaseError> {
  constructor(errorMsg: string) {
    super(false, {
      message: `Error restoring Manuscript: ${errorMsg}`,
    });
  }
}
