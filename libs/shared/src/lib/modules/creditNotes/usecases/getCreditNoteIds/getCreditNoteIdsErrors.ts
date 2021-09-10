import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class FilteringCreditNotesDbError extends UseCaseError {
  constructor(err: Error) {
    super(
      `While filtering credit notes the db encountered an error: ${err.message}: ${err.stack}`
    );
  }
}
