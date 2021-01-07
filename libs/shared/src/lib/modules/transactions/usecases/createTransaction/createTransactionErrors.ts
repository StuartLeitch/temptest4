import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class ManuscriptIdRequiredError extends UseCaseError {
  constructor() {
    super(`ManuscriptId is required.`);
  }
}

export class JournalIdRequiredError extends UseCaseError {
  constructor() {
    super(`JournalId is required.`);
  }
}

export class AuthorsEmailsRequiredError extends UseCaseError {
  constructor() {
    super(`Authors emails are required.`);
  }
}

export class TransactionCreatedError extends UseCaseError {
  constructor(err: Error) {
    super(`Can't create a new Transaction: ${err.message} \n ${err.stack}`);
  }
}

export class InvoiceCreatedError extends UseCaseError {
  constructor(err: Error) {
    super(`Can't create a new Invoice: ${err.message} \n ${err.stack}`);
  }
}

export class InvoiceItemCreatedError extends UseCaseError {
  constructor(err: Error) {
    super(`Can't create a new Invoice Item: ${err.message} \n ${err.stack}`);
  }
}

export class CatalogItemNotFoundError extends UseCaseError {
  constructor(journalId: string) {
    super(`Couldn't find a Catalog Item for Journal id = {${journalId}}.`);
  }
}

export class SaveInvoiceError extends UseCaseError {
  constructor(err: Error) {
    super(
      `While saving the invoice an error ocurred: ${err.message}, with stack ${err.stack}`
    );
  }
}

export class SaveInvoiceItemError extends UseCaseError {
  constructor(err: Error) {
    super(
      `While saving the invoice item an error ocurred: ${err.message}, with stack ${err.stack}`
    );
  }
}

export class SaveTransactionError extends UseCaseError {
  constructor(err: Error) {
    super(
      `While saving the transaction an error ocurred: ${err.message}, with stack ${err.stack}`
    );
  }
}

export class SaveRemindersStateError extends UseCaseError {
  constructor(err: Error) {
    super(
      `While saving the reminders state an error ocurred: ${err.message}, with stack ${err.stack}`
    );
  }
}

export class ManuscriptNotFoundError extends UseCaseError {
  constructor(manuscriptId: string) {
    super(`Could not find a manuscript with id {${manuscriptId}}`);
  }
}

export class WaiversCalculationError extends UseCaseError {
  constructor(err: Error) {
    super(
      `While calculating the waiver to apply for invoice an error occured: ${err.message}, with stack ${err.stack}`
    );
  }
}
