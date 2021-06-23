import { GuardFailure } from '../../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';

import * as Errors from './createEditorErrors';

export type CreateEditorResponse = Either<
  Errors.JournalDoesntExistError | UnexpectedError,
  void
>;
