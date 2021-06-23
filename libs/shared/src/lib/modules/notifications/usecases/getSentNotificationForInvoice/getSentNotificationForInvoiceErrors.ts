import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceIdRequired extends UseCaseError {
  constructor() {
    super(`Invoice id is required.`);
  }
}

export class EncounteredDbError extends UseCaseError {
  constructor(id: string, e: Error) {
    super(
      ` When accessing notifications by invoice id {${id}} an error was encountered: ${e.message}`
    );
  }
}

export class InvoiceNotFoundError extends UseCaseError {
  constructor(id: string) {
    super(`The invoice with id {${id}} was not found.`);
  }
}
