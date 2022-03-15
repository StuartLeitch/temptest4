import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';
import { GuardFailure } from '../../../../../core/logic/GuardFailure';

import * as Errors from './publishJournalAPCUpdatedErrors';

export type PublishJournalAPCUpdatedResponse = Either<
  Errors.JournalRequiredError | GuardFailure | UnexpectedError,
  void
>;
