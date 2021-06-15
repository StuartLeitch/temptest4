import { UseCaseError } from '../../../../../core/logic/UseCaseError';

export class ManuscriptRequiredError extends UseCaseError {
  constructor() {
    super('Manuscript is required.');
  }
}

export class InvoiceItemsRequiredError extends UseCaseError {
  constructor() {
    super('Invoice items required.');
  }
}

export class InvoiceRequiredError extends UseCaseError {
  constructor() {
    super('Invoice required.');
  }
}

export class SQSServiceFailure extends UseCaseError {
  constructor(public errorMsg: string) {
    super(`SQS Service failure: ${errorMsg}`);
  }
}
