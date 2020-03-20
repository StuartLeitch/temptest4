import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { ResumeConfirmationRemindersErrors } from './resumeConfirmationRemindersErrors';

export type ResumeConfirmationRemindersResponse = Either<
  | ResumeConfirmationRemindersErrors.ConfirmationRemindersNotPausedError
  | ResumeConfirmationRemindersErrors.InvoiceIdRequiredError
  | ResumeConfirmationRemindersErrors.InvoiceNotFoundError
  | AppError.UnexpectedError,
  Result<void>
>;
