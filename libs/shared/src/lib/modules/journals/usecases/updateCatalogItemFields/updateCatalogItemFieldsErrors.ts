import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class CatalogNotFound extends UseCaseError {
  constructor(journalId: string) {
    super(`Couldn't find a journal with id {${journalId}}.`);
  }
}

export class AmountIsZeroError extends UseCaseError {
  constructor() {
    super(`The amount entered is zero.`);
  }
}

export class AmountNotFoundError extends UseCaseError {
  constructor() {
    super(`The amount has not been found.`);
  }
}

export class AmountIllegalFormatError extends UseCaseError {
  constructor() {
    super(`The amount has wrong format.`);
  }
}
