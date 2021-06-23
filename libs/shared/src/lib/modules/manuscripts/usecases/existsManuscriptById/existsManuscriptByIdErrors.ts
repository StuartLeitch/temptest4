import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class ManuscriptIdRequiredError extends UseCaseError {
  constructor() {
    super(`Manuscript id is required.`);
  }
}

export class ManuscriptExistsByIdDbError extends UseCaseError {
  constructor(err: Error, id: string) {
    super(
      `While checking if manuscript with id ${id} exists an error from db occurred ${err.message}, with stack: ${err.stack}`
    );
  }
}
