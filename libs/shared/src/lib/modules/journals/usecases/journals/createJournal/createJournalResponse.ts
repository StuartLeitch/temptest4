import {AppError} from '../../../../../core/logic/AppError';
import {Either, Result} from '../../../../../core/logic/Result';

// import {CreateJournalErrors} from './createJournalErrors';

export type CreateJournalResponse = Either<
  // | CreateEditorErrors.JournalDoesntExistError
  AppError.UnexpectedError | Result<any>,
  Result<void>
>;
