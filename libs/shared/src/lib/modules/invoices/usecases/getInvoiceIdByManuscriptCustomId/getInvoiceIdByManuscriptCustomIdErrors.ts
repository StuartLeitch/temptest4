import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class ManuscriptNotFoundError extends UseCaseError {
  constructor(customId: string) {
    super(`Couldn't find an Manuscript with Custom Id {${customId}}.`);
  }
}

export class InvoiceItemNotFoundError extends UseCaseError {
  constructor(manuscriptId: string) {
    super(
      `Couldn't find an Invoice Item associated with Manuscript Id {${manuscriptId}}.`
    );
  }
}
