import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class JournalIdRequiredError extends UseCaseError {
  constructor() {
    super(`The journal id is required.`);
  }
}

export class JournalAmountRequiredError extends UseCaseError {
  constructor(journalId: string) {
    super(`The amount for journal with id {${journalId}} was not found`);
  }
}

export class JournalAmountBelowZeroError extends UseCaseError {
  constructor(journalId: string) {
    super(`The amount for journal with id {${journalId}} is below 0.`);
  }
}

export class JournalAmountFormatError extends UseCaseError {
  constructor(journalId: string) {
    super(`The amount for journal with id {${journalId}} has wrong format.`);
  }
}

export class JournalAmountTooLargeError extends UseCaseError {
  constructor(journalId: string) {
    super(`The amount for journal {${journalId}} exceeds limit.`);
  }
}
