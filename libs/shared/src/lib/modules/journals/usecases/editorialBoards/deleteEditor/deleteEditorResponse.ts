import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';

import * as DeleteEditorErrors from './deleteEditorErrors';

export type DeleteEditorResponse = Either<
  DeleteEditorErrors.JournalDoesNotExistError | UnexpectedError,
  void
>;
