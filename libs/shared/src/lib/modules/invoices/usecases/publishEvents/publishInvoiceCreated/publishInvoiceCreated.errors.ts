import { UseCaseError } from '../../../../../core/logic/UseCaseError';

export class ManuscriptRequiredError extends UseCaseError {
  constructor() {
    super(`Manuscript is required.`);
  }
}

export class InvoiceItemsRequiredError extends UseCaseError {
  constructor() {
    super(`Invoice items are required.`);
  }
}

export class InvoiceRequiredError extends UseCaseError {
  constructor() {
    super(`Invoice is required.`);
  }
}
