import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class EligibilityNotUpdated extends UseCaseError {
  constructor() {
    super(`Couldn't not update eligibility`);
  }
}
