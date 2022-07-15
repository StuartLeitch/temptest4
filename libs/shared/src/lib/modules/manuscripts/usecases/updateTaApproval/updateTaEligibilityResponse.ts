import { UnexpectedError } from '../../../../core/logic/AppError';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './updateTaEligibilityErrors';

export type UpdateTaEligibilityResponse = Either<
  Errors.EligibilityNotUpdated | UnexpectedError | GuardFailure,
  void
>;
