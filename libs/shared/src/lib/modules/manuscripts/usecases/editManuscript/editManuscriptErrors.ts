import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class ManuscriptFoundError extends UseCaseError {
  constructor(manuscriptId: string) {
    super(`Couldn't find a Manuscript for id = {${manuscriptId}}.`);
  }
}

export class ManuscriptUpdateDbError extends UseCaseError {
  constructor(err: Error) {
    super(
      `While saving the updates to manuscript an error ocurred: ${err.message}, with stack ${err.stack}`
    );
  }
}
