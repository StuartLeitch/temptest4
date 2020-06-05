import { AppError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';

import * as DeleteEditorErrors from './deleteEditorErrors';

export type DeleteEditorResponse = Either<
  DeleteEditorErrors.JournalDoesNotExistError | AppError.UnexpectedError,
  void
>;
