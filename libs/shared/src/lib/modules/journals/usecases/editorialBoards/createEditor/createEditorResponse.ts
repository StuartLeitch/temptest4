import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either, Result } from '../../../../../core/logic/Result';

import { CreateEditorErrors } from './createEditorErrors';

export type CreateEditorResponse = Either<
  CreateEditorErrors.JournalDoesntExistError | UnexpectedError | Result<any>,
  Result<void>
>;
